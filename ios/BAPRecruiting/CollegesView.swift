//
//  CollegesView.swift
//  BAP Recruiting
//
//  Searchable college database (reference data) with division + state filters
//  and a fit estimate. Detail screen lets the client save a school and draft an
//  email. Fit notes are computed from real attributes, not hardcoded prose.
//

import SwiftUI

struct CollegesView: View {
    @EnvironmentObject var state: AppState
    @State private var search = ""
    @State private var div = ""
    @State private var stateFilter = ""

    private let divs = ["D1","D2","D3","NAIA","JUCO"]

    private var results: [College] {
        collegeDB.filter { c in
            if !div.isEmpty && c.div != div { return false }
            if !stateFilter.isEmpty && c.state != stateFilter { return false }
            if !search.isEmpty {
                let q = search.lowercased()
                if !c.name.lowercased().contains(q) && !c.city.lowercased().contains(q) && !c.state.lowercased().contains(q) {
                    return false
                }
            }
            return true
        }
    }

    var body: some View {
        ScreenScroll {
            // Header + search + division pills
            VStack(alignment: .leading, spacing: 12) {
                Text("大学データベース").font(.bapTitle).foregroundColor(BAP.text)
                SearchField(placeholder: "大学名・都市・州で検索…", text: $search)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterPill(title: "すべて", selected: div.isEmpty) { div = "" }
                        ForEach(divs, id: \.self) { d in
                            FilterPill(title: d, selected: div == d) { div = d }
                        }
                    }
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            // Count + state picker
            HStack {
                (Text("\(results.count)").font(.system(size: 13, weight: .bold)).foregroundColor(BAP.blue)
                 + Text(" 校").font(.bapSecondary).foregroundColor(BAP.text2))
                Spacer()
                Menu {
                    Button("すべての州") { stateFilter = "" }
                    ForEach(allStates, id: \.self) { s in Button(s) { stateFilter = s } }
                } label: {
                    HStack(spacing: 6) {
                        Text(stateFilter.isEmpty ? "すべての州" : stateFilter).font(.system(size: 13, weight: .medium))
                        Image(systemName: "chevron.down").font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundColor(BAP.text)
                    .padding(.horizontal, 12).frame(height: 34)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(BAP.border, lineWidth: 1.5))
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.vertical, 12)
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            // Results
            VStack(spacing: 8) {
                if results.isEmpty {
                    Text("該当する大学が見つかりませんでした")
                        .font(.bapBody).foregroundColor(BAP.text3).padding(.vertical, 40)
                } else {
                    ForEach(results) { c in
                        NavigationLink { CollegeDetailView(college: c) } label: { CollegeRow(college: c) }
                            .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 16)
        }
        .navigationBarHidden(true)
    }
}

struct CollegeRow: View {
    @EnvironmentObject var state: AppState
    let college: College
    var body: some View {
        Card(padding: 14) {
            HStack(alignment: .top, spacing: 12) {
                InitialsAvatar(text: college.name, size: 46)
                VStack(alignment: .leading, spacing: 4) {
                    Text(college.name).font(.bapCardTitle).foregroundColor(BAP.text).lineLimit(1)
                    Text("\(college.city), \(college.state) · \(college.conf)")
                        .font(.bapSecondary).foregroundColor(BAP.text3).lineLimit(1)
                    HStack(spacing: 6) {
                        Badge(text: college.div, kind: .navy)
                        if college.scholarship { Badge(text: "奨学金あり", kind: .green) }
                        if college.intl { Badge(text: "国際生受け入れ", kind: .blue) }
                    }
                }
                Spacer(minLength: 4)
                VStack(alignment: .trailing, spacing: 1) {
                    Text("\(college.matchPct)%").font(.system(size: 18, weight: .bold)).foregroundColor(BAP.blue)
                    Text("適性").font(.system(size: 10)).foregroundColor(BAP.text3)
                    Text("\(college.tuitionLabel)/年").font(.bapMeta).foregroundColor(BAP.text2).padding(.top, 6)
                }
            }
        }
    }
}

struct CollegeDetailView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) private var dismiss
    let college: College

    private var saved: Bool { state.savedIDs.contains(college.id) }
    private var contact: CoachContact? { state.contacts.first { $0.collegeId == college.id } }

    var body: some View {
        ScreenScroll {
            // Header
            VStack(alignment: .leading, spacing: 12) {
                BackChip(label: "大学リスト") { dismiss() }
                HStack(spacing: 12) {
                    InitialsAvatar(text: college.name, size: 56)
                    VStack(alignment: .leading, spacing: 6) {
                        Text(college.name).font(.bapTitle).foregroundColor(BAP.text)
                        HStack(spacing: 6) {
                            Badge(text: college.div, kind: .navy)
                            Badge(text: college.conf, kind: .gray)
                            if college.intl { Badge(text: "国際生受け入れ", kind: .blue) }
                        }
                    }
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            // Fit
            Section(title: "あなたとの適性") {
                Card {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(alignment: .lastTextBaseline, spacing: 8) {
                            Text("\(college.matchPct)%").font(.system(size: 38, weight: .bold)).foregroundColor(BAP.blue)
                            Text("マッチ率").font(.bapSecondary).foregroundColor(BAP.text2)
                        }
                        ProgressBar(value: Double(college.matchPct) / 100)
                        Text(fitNote).font(.bapSecondary).foregroundColor(BAP.text2).lineSpacing(5)
                    }
                }
            }

            // Key data
            Section(title: "基本情報") {
                Card(padding: 0) {
                    VStack(spacing: 0) {
                        infoRow("学費 / 年", college.tuitionLabel)
                        infoRow("奨学金", college.scholarship ? "あり" : "なし（D3）")
                        infoRow("最低GPA目安", String(format: "%.1f", college.gpa))
                        infoRow("ロスター規模", "\(college.roster)名前後")
                        infoRow("コンファレンス", college.conf, last: true)
                    }
                }
            }

            if let contact {
                Section(title: "連絡状況") {
                    Card {
                        HStack {
                            Text("現在のステータス").font(.bapBody).foregroundColor(BAP.text2)
                            Spacer()
                            Badge(text: contact.statusEnum.label, kind: contact.statusEnum.badge)
                        }
                    }
                }
            }

            // Actions
            VStack(spacing: 10) {
                NavigationLink { EmailBuilderView(prefillSchool: college.name) } label: {
                    Text("このコーチにメールを送る").font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                        .frame(maxWidth: .infinity).frame(height: 50).background(BAP.blue)
                        .clipShape(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous))
                }
                SecondaryButton(title: saved ? "保存済み — 削除する" : "保存する") {
                    Task { await state.toggleSaved(college) }
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 24)
        }
        .navigationBarHidden(true)
    }

    private var fitNote: String {
        var pros: [String] = []
        if college.intl { pros.append("国際選手の受け入れ実績あり") }
        if let gpa = state.player?.gpa, gpa >= college.gpa { pros.append("GPAが学業要件を満たしています") }
        if college.scholarship { pros.append("奨学金の可能性あり") }
        let prosLine = pros.isEmpty ? "学業・競技の両面で検討の価値があります。" : "適性が高い点: " + pros.joined(separator: "、")
        let watch = college.div == "D1"
            ? "要注意: D1は競争が激しいため、指標と動画の充実が鍵になります。"
            : "ヒント: 早めのコーチ連絡が好印象につながります。"
        return prosLine + "\n" + watch
    }

    private func infoRow(_ l: String, _ v: String, last: Bool = false) -> some View {
        VStack(spacing: 0) {
            HStack {
                Text(l).font(.bapBody).foregroundColor(BAP.text2)
                Spacer()
                Text(v).font(.system(size: 14, weight: .semibold)).foregroundColor(BAP.text)
            }
            .padding(.vertical, 13).padding(.horizontal, 16)
            if !last { Divider().background(BAP.border).padding(.horizontal, 16) }
        }
    }
}
