"""Step 2 of export_onnx.py: MatMul weights to 8 bits as MatMulNBits, which keeps them 8-bit in
memory and expands a block at a time (weights behind DequantizeLinear are all expanded up front)."""
import sys, onnx
from onnxruntime.quantization import matmul_nbits_quantizer as q
src, dst = sys.argv[1], sys.argv[2]
m = onnx.load(src)
cfg = q.DefaultWeightOnlyQuantConfig(block_size=128, is_symmetric=False, bits=8, op_types_to_quantize=('MatMul',))
quant = q.MatMulNBitsQuantizer(m, bits=8, block_size=128, is_symmetric=False, algo_config=cfg, op_types_to_quantize=('MatMul',))
quant.process()
onnx.save(quant.model.model, dst)
from collections import Counter
print(Counter(n.op_type for n in quant.model.model.graph.node if n.op_type in ('MatMul', 'MatMulNBits', 'Conv')))
