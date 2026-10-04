//
//  ProfileView.swift
//  BAP Recruiting
//
//  Player profile with tabbed sections: metrics, videos, goals, documents,
//  English glossary. Plus edit, timeline shortcut, and logout.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var state: AppState
    @State private var tab: Tab = .metrics

    enum Tab: String, CaseIterable { case metrics, videos, goals, docs, english
        var label: String {
            switch self {
            case .metrics: return "指標"
            case .videos:  return "動画"
            case .goals:   return "目標"
            case .docs:    return "書類"
            case .english: return "英語"
            }
        }
    }

    var body: some View {
        ScreenScroll {
            header
            // Tabs
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 0) {
                    ForEach(Tab.allCases, id: \.self) { t in
                        Button { tab = t } label: {
                            Text(t.label).font(.system(size: 13, weight: .semibold))
                                .foregroundColor(tab == t ? BAP.blue : BAP.text3)
                                .padding(.horizontal, 16).padding(.vertical, 12)
                                .overlay(Rectangle().fill(tab == t ? BAP.blue : .clear).frame(height: 2), alignment: .bottom)
                        }.buttonStyle(.plain)
                    }
                }
            }
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            tabContent

            VStack(spacing: 10) {
                NavigationLink { TimelineView() } label: {
                    Text("リクルーティング タイムライン").font(.system(size: 15, weight: .semibold)).foregroundColor(BAP.text)
                        .frame(maxWidth: .infinity).frame(height: 50).background(BAP.white)
                        .overlay(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous).stroke(BAP.borderMd, lineWidth: 1.5))
                }
                SecondaryButton(title: "ログアウト") { Task { await state.logout() } }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 20)
        }
        .navigationBarHidden(true)
    }

    private var header: some View {
        let p = state.player
        return VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous).fill(BAP.navy).frame(width: 52, height: 52)
                    Image(systemName: "person.fill").font(.system(size: 22)).foregroundColor(.white)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(p?.name ?? "").font(.bapNav).foregroundColor(BAP.text)
                    Text([p?.position, p?.gradYear.map { "\($0)年卒業" }].compactMap { $0 }.joined(separator: " · "))
                        .font(.bapSecondary).foregroundColor(BAP.text3)
                }
                Spacer()
                NavigationLink { EditProfileView() } label: {
                    Text("編集").font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                }
            }
            HStack(spacing: 8) {
                miniStat("身長", p?.displayHeight ?? "—")
                miniStat("体重", p?.displayWeight ?? "—")
                miniStat("GPA", p?.displayGPA ?? "—")
                miniStat("投打", [p?.throwsHand, p?.bats].compactMap { $0 }.joined(separator: "/"))
            }
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BAP.white)
        .overlay(Divider().background(BAP.border), alignment: .bottom)
    }

    private func miniStat(_ label: String, _ value: String) -> some View {
        VStack(spacing: 2) {
            Text(value.isEmpty ? "—" : value).font(.system(size: 15, weight: .bold)).foregroundColor(BAP.navy)
            Text(label).font(.system(size: 11)).foregroundColor(BAP.text3)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 10)
        .background(BAP.blueSoft).clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    @ViewBuilder private var tabContent: some View {
        switch tab {
        case .metrics: metricsTab
        case .videos:  videosTab
        case .goals:   goalsTab
        case .docs:    docsTab
        case .english: englishTab
        }
    }

    private var metricsTab: some View {
        VStack(spacing: 8) {
            if state.metrics.isEmpty { EmptyStateCard(message: "指標はまだありません") }
            else {
                ForEach(state.metrics) { m in
                    Card(padding: 14) {
                        HStack(alignment: .top) {
                            Text(m.metricKey ?? "").font(.bapCardTitle).foregroundColor(BAP.text)
                            Spacer()
                            (Text(m.value.map { numString($0) } ?? "—").font(.system(size: 22, weight: .bold)).foregroundColor(BAP.navy)
                             + Text(m.unit.map { " \($0)" } ?? "").font(.bapSecondary).foregroundColor(BAP.text3))
                        }
                    }
                }
            }
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 16)
    }

    private var videosTab: some View {
        VStack(spacing: 8) {
            if state.videos.isEmpty { EmptyStateCard(message: "動画はまだありません") }
            else {
                Card(padding: 0) {
                    VStack(spacing: 0) {
                        ForEach(state.videos) { v in
                            HStack(spacing: 12) {
                                RoundedRectangle(cornerRadius: 10).fill(BAP.blueSoft).frame(width: 40, height: 40)
                                    .overlay(Image(systemName: "play.fill").font(.system(size: 14)).foregroundColor(BAP.blue))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(v.title ?? v.kind ?? "").font(.bapCardTitle).foregroundColor(BAP.text)
                                    Text(v.kind ?? "").font(.bapMeta).foregroundColor(BAP.text3)
                                }
                                Spacer()
                                Badge(text: v.status ?? "", kind: .green)
                            }
                            .padding(13)
                            if v.id != state.videos.last?.id { Divider().background(BAP.border).padding(.horizontal, 13) }
                        }
                    }
                }
            }
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 16)
    }

    private var goalsTab: some View {
        VStack(spacing: 8) {
            if state.goals.isEmpty { EmptyStateCard(message: "目標はまだありません") }
            else {
                ForEach(state.goals) { g in
                    Card(padding: 14) {
                        HStack {
                            Text(g.label ?? "").font(.bapCardTitle).foregroundColor(BAP.text)
                            Spacer()
                            HStack(spacing: 4) {
                                Text(g.currentVal.map { numString($0) } ?? "").foregroundColor(BAP.text2)
                                Text("→").foregroundColor(BAP.text3)
                                Text(g.targetVal.map { numString($0) } ?? "").font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                                Text(g.unit ?? "").foregroundColor(BAP.text3)
                            }.font(.bapSecondary)
                        }
                    }
                }
            }
            NavigationLink { AddGoalView() } label: {
                Text("+ 目標を追加").font(.system(size: 15, weight: .semibold)).foregroundColor(BAP.text)
                    .frame(maxWidth: .infinity).frame(height: 50).background(BAP.white)
                    .overlay(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous).stroke(BAP.borderMd, lineWidth: 1.5))
            }
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 16)
    }

    private var docsTab: some View {
        VStack(spacing: 8) {
            if state.documents.isEmpty { EmptyStateCard(message: "書類はまだありません") }
            else {
                Card(padding: 0) {
                    VStack(spacing: 0) {
                        ForEach(state.documents) { d in
                            HStack {
                                Text(d.label ?? d.kind ?? "").font(.bapCardTitle).foregroundColor(BAP.text)
                                Spacer()
                                switch d.status {
                                case "complete": Badge(text: "完了", kind: .green)
                                case "missing":  Badge(text: "未提出", kind: .red)
                                default:         Badge(text: "準備中", kind: .amber)
                                }
                            }
                            .padding(13)
                            if d.id != state.documents.last?.id { Divider().background(BAP.border).padding(.horizontal, 13) }
                        }
                    }
                }
            }
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 16)
    }

    private var englishTab: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("リクルーティングに必要な英語用語を覚えておきましょう。タップして説明を確認できます。")
                .font(.bapSecondary).foregroundColor(BAP.text2).lineSpacing(4).padding(.bottom, 4)
            ForEach(vocab) { v in VocabCard(item: v) }
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 16)
    }

    private func numString(_ v: Double) -> String { v == v.rounded() ? String(Int(v)) : String(v) }
}

struct VocabCard: View {
    let item: VocabItem
    @State private var open = false
    var body: some View {
        Card(padding: 14) {
            VStack(alignment: .leading, spacing: 0) {
                Button { withAnimation(.easeOut(duration: 0.15)) { open.toggle() } } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.en).font(.bapCardTitle).foregroundColor(BAP.text)
                            Text(item.ja).font(.system(size: 13, weight: .medium)).foregroundColor(BAP.blue)
                        }
                        Spacer()
                        Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                            .foregroundColor(BAP.text3).rotationEffect(.degrees(open ? 90 : 0))
                    }
                    .contentShape(Rectangle())
                }.buttonStyle(.plain)
                if open {
                    Divider().background(BAP.border).padding(.vertical, 10)
                    Text(item.desc).font(.bapSecondary).foregroundColor(BAP.text2).lineSpacing(5)
                }
            }
        }
    }
}
