"""Step 3 of export_onnx.py. Weight-only 8-bit, asymmetric, per output channel: the same scheme as the iOS model
(coremltools linear mode). Activations stay float32; each weight goes through DequantizeLinear."""
import sys
import numpy as np
import onnx
from onnx import helper, numpy_helper

src, dst = sys.argv[1], sys.argv[2]
only = set(sys.argv[3:])  # op types to quantize, all when empty
model = onnx.load(src)
graph = model.graph
inits = {i.name: i for i in graph.initializer}
consumers = {}
for node in graph.node:
    for k, name in enumerate(node.input):
        consumers.setdefault(name, []).append((node, k))

def axis_for(node, k, shape):
    if node.op_type == 'Conv' and k == 1: return 0
    if node.op_type == 'MatMul' and k == 1 and len(shape) == 2: return 1
    if node.op_type == 'Gemm' and k == 1:
        trans = next((a.i for a in node.attribute if a.name == 'transB'), 0)
        return 0 if trans else 1
    return None

new_inits, new_nodes, done, before, after = [], [], 0, 0, 0
for name, init in list(inits.items()):
    uses = consumers.get(name, [])
    w = numpy_helper.to_array(init)
    if w.dtype != np.float32 or w.size < 4096 or not uses: continue
    if only and any(n.op_type not in only for n, _ in uses): continue
    axes = {axis_for(n, k, w.shape) for n, k in uses}
    if len(axes) != 1 or None in axes: continue
    axis = axes.pop()
    moved = np.moveaxis(w, axis, 0).reshape(w.shape[axis], -1)
    lo, hi = np.minimum(moved.min(1), 0), np.maximum(moved.max(1), 0)
    scale = np.where(hi > lo, (hi - lo) / 255, 1.0).astype(np.float32)
    zp = np.clip(np.round(-lo / scale), 0, 255).astype(np.uint8)
    shape = [1] * w.ndim; shape[axis] = -1
    q = np.clip(np.round(w / scale.reshape(shape)) + zp.reshape(shape), 0, 255).astype(np.uint8)
    graph.initializer.remove(init)
    new_inits += [numpy_helper.from_array(q, name + '_q'), numpy_helper.from_array(scale, name + '_s'),
                  numpy_helper.from_array(zp, name + '_z')]
    new_nodes.append(helper.make_node('DequantizeLinear', [name + '_q', name + '_s', name + '_z'], [name],
                                      axis=axis, name=name + '_dq'))
    done += 1; before += w.nbytes; after += q.nbytes
graph.initializer.extend(new_inits)
# Each DequantizeLinear right before its first user: ONNX Runtime runs nodes in this order, and
# with all of them up front every weight would be expanded to float32 at once (910 MB).
dq_for = {n.output[0]: n for n in new_nodes}
ordered = []
for node in list(graph.node):
    for x in node.input:
        if x in dq_for:
            ordered.append(dq_for.pop(x))
    ordered.append(node)
del graph.node[:]
graph.node.extend(ordered)
onnx.save(model, dst)
print(f'quantized {done} weights: {before/1e6:.0f} MB -> {after/1e6:.0f} MB')
