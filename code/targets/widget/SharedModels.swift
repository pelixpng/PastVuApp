//
//  SharedModels.swift
//  PastVu
//
//  Created by Семен Кузьмин on 11/2/25.
//
import WidgetKit
import SwiftUI

struct HistoryItem: Codable {
    let cid: String
    let description: String
    let file: String
    let title: String
}

struct HistoryListEntryItem: Identifiable {
    let id: String
    let historyItem: HistoryItem
    let imageData: Data?
    
    init(historyItem: HistoryItem, imageData: Data?) {
        self.id = historyItem.cid
        self.historyItem = historyItem
        self.imageData = imageData
    }
}
