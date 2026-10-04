//
//  ScoreView.swift
//  BAP Recruiting
//
//  Recruiting-readiness score. Shows an empty state until scores exist; all
//  values come from the player_scores row.
//

import SwiftUI

struct ScoreView: View {
    @EnvironmentObject var state: AppState

    var body: some View {
        ScreenScroll {
            if let sc = state.scores {
                filled(sc)
            } else {
                empty
            }
        }
        .navigationBarHidden(true)
    }

    private var headerBar: some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionLabel("リクルーティング進捗スコア")
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BAP.white)
        .overlay(Divider().background(BAP.border), alignment: .bottom)
    }

    private var empty: some View {
        VStack(spacing: 0) {
            headerBar
            Section(title: " ") {
                EmptyStateCard(message: "進捗スコアはまだありません。プロフィール・指標・動画を追加すると評価が生成されます。")
            }
        }
    }

    private func filled(_ sc: PlayerScores) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Big score header
            VStack(alignment: .leading, spacing: 4) {
                SectionLabel("リクルーティング進捗スコア")
                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text("\(sc.readiness)").font(.system(size: 52, weight: .bold)).foregroundColor(BAP.navy).tracking(-2)
                    Text("/ 100").font(.bapSecondary).foregroundColor(BAP.text3)
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 24)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            if let fit = sc.divisionFit, !fit.isEmpty {
                Section(title: "現在の適性") {
                    Card(padding: 0) {
                        VStack(spacing: 0) {
                            ForEach(fit) { f in
                                HStack {
                                    Text(f.division).font(.bapCardTitle).foregroundColor(BAP.text)
                                    Spacer()
                                    Badge(text: f.label, kind: .navy)
                                }
                                .padding(14)
                                if f.id != fit.last?.id { Divider().background(BAP.border).padding(.horizontal, 16) }
                            }
                        }
                    }
                }
            }

            Section(title: "カテゴリー別スコア") {
                Card(padding: 16) {
                    VStack(spacing: 0) {
                        let entries = sc.scores.sorted { $0.key < $1.key }
                        ForEach(entries, id: \.key) { key, value in
                            ScoreRow(label: scoreLabels[key] ?? key, value: value)
                            if key != entries.last?.key { Divider().background(BAP.border) }
                        }
                    }
                }
            }
        }
    }
}

struct ScoreRow: View {
    let label: String
    let value: Int
    private var color: Color { value >= 90 ? BAP.success : (value >= 75 ? BAP.blue : BAP.warning) }
    var body: some View {
        HStack(spacing: 10) {
            Text(label).font(.system(size: 13, weight: .medium)).foregroundColor(BAP.text2).frame(width: 90, alignment: .leading)
            ProgressBar(value: Double(value) / 100, tint: color)
            Text("\(value)").font(.system(size: 15, weight: .bold)).foregroundColor(color).frame(width: 28, alignment: .trailing)
            Text(value < 80 ? "要改善" : "").font(.bapBadge).foregroundColor(BAP.warning).frame(width: 44, alignment: .trailing)
        }
        .padding(.vertical, 12)
    }
}
