import WidgetKit
import SwiftUI

@main
struct exportWidgets: WidgetBundle {
    var body: some Widget {
      HistoryListWidget()
      SlideShowListWidget()
        //HelloWidget() до лучших времен
    }
}
