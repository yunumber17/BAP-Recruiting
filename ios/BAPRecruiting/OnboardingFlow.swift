//
//  OnboardingFlow.swift
//  BAP Recruiting
//
//  3-step setup. Saves the profile to the player's row, then enters the app.
//  Empty by default — the client enters their own information.
//

import SwiftUI

struct OnboardingFlow: View {
    @EnvironmentObject var state: AppState
    @State private var step = 1
    @State private var name = ""
    @State private var school = ""
    @State private var position = "SS（ショート）"
    @State private var year = "2027"
    @State private var busy = false

    private let positions = ["SS（ショート）","P（ピッチャー）","C（キャッチャー）","1B","2B","3B","OF（外野手）"]
    private let years = ["2026","2027","2028","2029"]

    var body: some View {
        ZStack {
            BAP.canvas.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    StepDots(step: step, total: 3).padding(.bottom, 32)
                    switch step {
                    case 1: stepOne
                    case 2: stepTwo
                    default: stepThree
                    }
                }
                .padding(.horizontal, BAP.hPad)
                .padding(.top, 40)
                .padding(.bottom, 32)
            }
        }
    }

    private var stepOne: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("あなたについて教えてください").font(.bapTitle).foregroundColor(BAP.text)
            Text("リクルーティングプランを作成します").font(.bapSecondary).foregroundColor(BAP.text2)
                .padding(.bottom, 16)
            LabeledField(label: "氏名", placeholder: "氏名を入力", text: $name)
            LabeledField(label: "高校名", placeholder: "例: 桐蔭学園高校", text: $school)
            PrimaryButton(title: "次へ") { step = 2 }.padding(.top, 8)
        }
    }

    private var stepTwo: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("野球情報").font(.bapTitle).foregroundColor(BAP.text)
            Text("ポジションと卒業年度を教えてください").font(.bapSecondary).foregroundColor(BAP.text2)
                .padding(.bottom, 8)

            Text("ポジション").font(.system(size: 12, weight: .semibold)).foregroundColor(BAP.text2)
            Card(padding: 0) {
                VStack(spacing: 0) {
                    ForEach(positions, id: \.self) { p in
                        OptionRow(label: p, selected: position == p) { position = p }
                        if p != positions.last { Divider().background(BAP.border).padding(.horizontal, 16) }
                    }
                }
            }

            Text("卒業年度").font(.system(size: 12, weight: .semibold)).foregroundColor(BAP.text2).padding(.top, 4)
            HStack(spacing: 8) {
                ForEach(years, id: \.self) { y in
                    FilterPill(title: y, selected: year == y) { year = y }
                }
            }

            HStack(spacing: 8) {
                SecondaryButton(title: "戻る") { step = 1 }
                PrimaryButton(title: "次へ") { step = 3 }
            }
            .padding(.top, 8)
        }
    }

    private var stepThree: some View {
        VStack(spacing: 20) {
            ZStack {
                RoundedRectangle(cornerRadius: 16, style: .continuous).fill(BAP.blue).frame(width: 64, height: 64)
                Image(systemName: "checkmark").font(.system(size: 26, weight: .bold)).foregroundColor(.white)
            }
            .padding(.top, 16)
            Text("準備ができました").font(.bapTitle).foregroundColor(BAP.text)
            Text("\(name.isEmpty ? "あなた" : name)さんのリクルーティングプランを作成しました。一歩ずつ進めていきましょう。")
                .font(.bapSecondary).foregroundColor(BAP.text2)
                .multilineTextAlignment(.center).lineSpacing(6)
            PrimaryButton(title: busy ? "作成中…" : "アプリを始める") { finish() }.padding(.top, 8)
        }
        .frame(maxWidth: .infinity)
    }

    private func finish() {
        busy = true
        Task {
            await state.finishOnboarding(name: name, school: school, position: position, year: year)
            busy = false
        }
    }
}

struct StepDots: View {
    let step: Int
    let total: Int
    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...total, id: \.self) { i in
                Capsule()
                    .fill(i <= step ? BAP.blue : BAP.border)
                    .frame(height: 3)
            }
        }
    }
}

struct OptionRow: View {
    let label: String
    let selected: Bool
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack {
                Text(label).font(.system(size: 15)).foregroundColor(BAP.text)
                Spacer()
                ZStack {
                    Circle().fill(selected ? BAP.blue : Color.clear).frame(width: 18, height: 18)
                    if selected {
                        Image(systemName: "checkmark").font(.system(size: 9, weight: .bold)).foregroundColor(.white)
                    }
                }
            }
            .padding(.vertical, 14).padding(.horizontal, 16)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
