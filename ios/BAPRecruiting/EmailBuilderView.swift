//
//  EmailBuilderView.swift
//  BAP Recruiting
//
//  Generates a polished English outreach email from the player's real profile
//  + metrics. Copy to clipboard. No fabricated personal data.
//

import SwiftUI

struct EmailBuilderView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) private var dismiss

    enum Kind: String, CaseIterable { case initial, followup, thankyou, camp
        var label: String {
            switch self {
            case .initial:  return "初回メール"
            case .followup: return "フォローアップ"
            case .thankyou: return "お礼メール"
            case .camp:     return "キャンプ問い合わせ"
            }
        }
    }

    @State private var kind: Kind = .initial
    @State private var school: String
    @State private var coach: String

    init(prefillSchool: String = "", prefillCoach: String = "") {
        _school = State(initialValue: prefillSchool)
        _coach = State(initialValue: prefillCoach)
    }

    var body: some View {
        ScreenScroll {
            VStack(alignment: .leading, spacing: 16) {
                BackChip(label: "戻る") { dismiss() }
                VStack(alignment: .leading, spacing: 4) {
                    Text("メールビルダー").font(.bapTitle).foregroundColor(BAP.text)
                    Text("英語メールを自動生成します").font(.bapSecondary).foregroundColor(BAP.text3)
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            Section(title: "メールの種類") {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Kind.allCases, id: \.self) { k in
                            FilterPill(title: k.label, selected: kind == k) { kind = k }
                        }
                    }
                }
            }

            Section(title: " ") {
                VStack(spacing: 10) {
                    LabeledField(label: "大学名", placeholder: "University of Tampa", text: $school)
                    LabeledField(label: "コーチ名（任意）", placeholder: "Coach Reynolds", text: $coach)
                }
            }

            Section(title: "プレビュー（英語）") {
                Card {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("件名").font(.bapMeta).foregroundColor(BAP.text3)
                        Text(subject).font(.system(size: 14, weight: .semibold)).foregroundColor(BAP.text)
                            .padding(.bottom, 12)
                        Divider().background(BAP.border).padding(.bottom, 12)
                        Text(body).font(.bapSecondary).foregroundColor(BAP.text).lineSpacing(5)
                    }
                }
                HStack(spacing: 8) {
                    Button {
                        UIPasteboard.general.string = "Subject: \(subject)\n\n\(body)"
                    } label: {
                        Text("コピーする").font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                            .frame(maxWidth: .infinity).frame(height: 50).background(BAP.blue)
                            .clipShape(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous))
                    }.buttonStyle(PressableStyle())
                }
            }
        }
        .navigationBarHidden(true)
    }

    // MARK: Content

    private var name: String { state.player?.name ?? "[Your Name]" }
    private var gradYear: String { state.player?.gradYear.map(String.init) ?? "" }
    private var mySchool: String { state.player?.school ?? "my high school" }

    private var profileBlock: String {
        let lines = state.metrics.prefix(6).compactMap { m -> String? in
            guard let key = m.metricKey, let val = m.value else { return nil }
            return "- \(key): \(numString(val))\(m.unit.map { " \($0)" } ?? "")"
        }
        return lines.isEmpty ? "" : "\n\nMy current athletic profile:\n" + lines.joined(separator: "\n")
    }

    private var subject: String {
        let cls = gradYear.isEmpty ? "" : " - Class of \(gradYear)"
        switch kind {
        case .initial:  return "[Baseball Prospect] \(name)\(cls)"
        case .followup: return "Following Up - \(name)\(cls)"
        case .thankyou: return "Thank You - \(name)"
        case .camp:     return "Camp Inquiry - \(name)"
        }
    }

    private var body: String {
        let coachName = coach.isEmpty ? "Coach" : coach
        let prog = school.isEmpty ? "your program" : school
        let gradClause = gradYear.isEmpty ? "" : ", graduating in \(gradYear)"
        switch kind {
        case .initial:
            return """
            Dear \(coachName),

            My name is \(name). I am a student-athlete at \(mySchool)\(gradClause).

            I came across \(prog) and I am very impressed by your baseball program and academic environment. I believe it would be an excellent fit for me both athletically and academically.\(profileBlock)

            I have attached my recruiting profile and would love to share my highlight video. I would appreciate the opportunity to learn more about your program.

            Thank you for your time.

            Sincerely,
            \(name)
            """
        case .followup:
            return """
            Dear \(coachName),

            I hope you are doing well. I wanted to follow up on my earlier email regarding my interest in \(prog).

            I remain very interested in your baseball program and would welcome the opportunity to speak with you. I have added updated metrics and new footage to my profile since my last message.

            I understand you are busy, and I appreciate any time you can offer.

            Best regards,
            \(name)
            """
        case .thankyou:
            return """
            Dear \(coachName),

            Thank you so much for taking the time to speak with me. Our conversation reinforced my strong interest in \(prog).

            I am excited about the possibility of being part of your team and would be honored to contribute to the program's success.

            I look forward to hearing about next steps.

            Best regards,
            \(name)
            """
        case .camp:
            return """
            Dear \(coachName),

            My name is \(name)\(gradClause). I am very interested in attending your upcoming baseball camp and would appreciate information about registration, dates, and costs.

            I see this as a great opportunity to showcase my abilities and learn more about your program in person.

            Thank you for your time.

            Best regards,
            \(name)
            """
        }
    }

    private func numString(_ v: Double) -> String {
        v == v.rounded() ? String(Int(v)) : String(v)
    }
}
