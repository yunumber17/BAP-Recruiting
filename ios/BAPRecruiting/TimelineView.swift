//
//  TimelineView.swift
//  BAP Recruiting
//
//  Multi-year recruiting checklist. Items ship UNCHECKED — each client tracks
//  their own progress (stored per-account in AppState.timelineDone).
//

import SwiftUI

struct TimelineView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScreenScroll {
            FormHeader(back: "戻る", title: "リクルーティング タイムライン") { dismiss() }
            VStack(spacing: 12) {
                ForEach(timelineTemplate) { stage in
                    stageCard(stage)
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 16)
        }
        .navigationBarHidden(true)
    }

    private func key(_ stage: TimelineStage, _ index: Int) -> String { "\(stage.label)#\(index)" }

    private func stageCard(_ stage: TimelineStage) -> some View {
        let doneCount = stage.items.indices.filter { state.timelineDone.contains(key(stage, $0)) }.count
        let total = stage.items.count
        return Card {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(stage.label).font(.bapCardTitle).foregroundColor(BAP.text)
                        if stage.active { Badge(text: "現在", kind: .blue) }
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(doneCount) / \(total)").font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                        ProgressBar(value: total == 0 ? 0 : Double(doneCount) / Double(total)).frame(width: 80)
                    }
                }
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(Array(stage.items.enumerated()), id: \.offset) { idx, text in
                        let k = key(stage, idx)
                        let checked = state.timelineDone.contains(k)
                        Button {
                            if checked { state.timelineDone.remove(k) } else { state.timelineDone.insert(k) }
                        } label: {
                            HStack(spacing: 10) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: 5).fill(checked ? BAP.blue : .clear).frame(width: 20, height: 20)
                                    RoundedRectangle(cornerRadius: 5).stroke(checked ? BAP.blue : BAP.borderMd, lineWidth: 1.5).frame(width: 20, height: 20)
                                    if checked { Image(systemName: "checkmark").font(.system(size: 11, weight: .bold)).foregroundColor(.white) }
                                }
                                Text(text).font(.bapBody)
                                    .foregroundColor(checked ? BAP.text3 : BAP.text)
                                    .strikethrough(checked, color: BAP.text3)
                                Spacer()
                            }
                            .contentShape(Rectangle())
                        }.buttonStyle(.plain)
                    }
                }
            }
        }
        .overlay(stage.active ?
                 RoundedRectangle(cornerRadius: BAP.cardRadius).stroke(BAP.blue, lineWidth: 1.5) : nil)
    }
}
