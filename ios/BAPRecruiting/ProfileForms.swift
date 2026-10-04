//
//  ProfileForms.swift
//  BAP Recruiting
//
//  Edit-profile and add-goal forms. Empty fields by default; the client fills
//  in their own data, which is written to Supabase.
//

import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var school = ""
    @State private var position = ""
    @State private var gradYear = ""
    @State private var gpa = ""
    @State private var height = ""
    @State private var weight = ""

    var body: some View {
        ScreenScroll {
            FormHeader(back: "戻る", title: "プロフィールを編集") { dismiss() }
            VStack(spacing: 14) {
                LabeledField(label: "氏名", placeholder: "氏名", text: $name)
                LabeledField(label: "高校名", placeholder: "高校名", text: $school)
                LabeledField(label: "ポジション", placeholder: "例: SS, P, OF", text: $position)
                LabeledField(label: "卒業年度", placeholder: "2027", keyboard: .numberPad, text: $gradYear)
                LabeledField(label: "GPA", placeholder: "3.8", keyboard: .decimalPad, text: $gpa)
                LabeledField(label: "身長 (cm)", placeholder: "178", keyboard: .decimalPad, text: $height)
                LabeledField(label: "体重 (kg)", placeholder: "73", keyboard: .decimalPad, text: $weight)
                PrimaryButton(title: "保存する") { save() }.padding(.top, 6)
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 20)
        }
        .navigationBarHidden(true)
        .onAppear(perform: load)
    }

    private func load() {
        let p = state.player
        name = p?.name ?? ""
        school = p?.school ?? ""
        position = p?.position ?? ""
        gradYear = p?.gradYear.map(String.init) ?? ""
        gpa = p?.gpa.map { String($0) } ?? ""
        height = p?.heightCm.map { String(Int($0)) } ?? ""
        weight = p?.weightKg.map { String(Int($0)) } ?? ""
    }

    private func save() {
        let patch: [String: AnyJSON] = [
            "name": name.isEmpty ? .null : .string(name),
            "school": school.isEmpty ? .null : .string(school),
            "position": position.isEmpty ? .null : .string(position),
            "grad_year": Int(gradYear).map { .double(Double($0)) } ?? .null,
            "gpa": Double(gpa).map { .double($0) } ?? .null,
            "height_cm": Double(height).map { .double($0) } ?? .null,
            "weight_kg": Double(weight).map { .double($0) } ?? .null,
        ]
        Task { await state.saveProfile(patch); dismiss() }
    }
}

struct AddGoalView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) private var dismiss
    @State private var label = ""
    @State private var current = ""
    @State private var target = ""
    @State private var unit = ""

    var body: some View {
        ScreenScroll {
            FormHeader(back: "戻る", title: "目標を設定") { dismiss() }
            VStack(spacing: 14) {
                LabeledField(label: "目標名", placeholder: "例: Exit Velocity", text: $label)
                LabeledField(label: "現在の値", placeholder: "88", keyboard: .decimalPad, text: $current)
                LabeledField(label: "目標値", placeholder: "92", keyboard: .decimalPad, text: $target)
                LabeledField(label: "単位", placeholder: "mph", text: $unit)
                PrimaryButton(title: "保存する") {
                    guard !label.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                    Task { await state.addGoal(label: label, current: current, target: target, unit: unit); dismiss() }
                }.padding(.top, 6)
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 20)
        }
        .navigationBarHidden(true)
    }
}
