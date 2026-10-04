//
//  CoachView.swift
//  BAP Recruiting
//
//  Coach outreach tracker: contact list with status, a detail screen with an
//  email thread + status controls, and an add-contact form. All client-entered.
//

import SwiftUI

struct CoachView: View {
    @EnvironmentObject var state: AppState

    private var stats: [(String, Int, Color)] {
        let c = state.contacts
        return [
            ("総数", c.count, BAP.text),
            ("返信あり", c.filter { $0.statusEnum == .replied }.count, BAP.success),
            ("送信済み", c.filter { [.sent, .opened].contains($0.statusEnum) }.count, BAP.blue),
            ("未送信", c.filter { $0.statusEnum == .none }.count, BAP.text3),
        ]
    }

    var body: some View {
        ScreenScroll {
            // Header
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Text("コーチ連絡").font(.bapTitle).foregroundColor(BAP.text)
                    Spacer()
                    NavigationLink { AddContactView() } label: {
                        Text("+ コーチを追加").font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                    }
                }
                HStack(spacing: 8) {
                    ForEach(stats, id: \.0) { s in
                        VStack(spacing: 2) {
                            Text("\(s.1)").font(.system(size: 20, weight: .bold)).foregroundColor(s.2)
                            Text(s.0).font(.system(size: 11)).foregroundColor(BAP.text3)
                        }
                        .frame(maxWidth: .infinity).padding(.vertical, 10)
                        .background(BAP.blueSoft).clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            // List
            VStack(spacing: 8) {
                if state.contacts.isEmpty {
                    EmptyStateCard(message: "コーチ連絡はまだありません")
                    NavigationLink { AddContactView() } label: {
                        Text("+ コーチを追加").font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                            .frame(maxWidth: .infinity).frame(height: 50).background(BAP.blue)
                            .clipShape(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous))
                    }
                } else {
                    ForEach(state.contacts) { c in
                        NavigationLink { ContactDetailView(contactID: c.id) } label: { ContactRow(contact: c) }
                            .buttonStyle(.plain)
                    }
                    NavigationLink { AddContactView() } label: {
                        Text("+ コーチを追加").font(.system(size: 15, weight: .semibold)).foregroundColor(BAP.text)
                            .frame(maxWidth: .infinity).frame(height: 50).background(BAP.white)
                            .overlay(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous).stroke(BAP.borderMd, lineWidth: 1.5))
                    }
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 16)
        }
        .navigationBarHidden(true)
    }
}

struct ContactRow: View {
    let contact: CoachContact
    var body: some View {
        Card(padding: 14) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top, spacing: 12) {
                    InitialsAvatar(text: contact.coachName ?? "?", size: 44, tint: Color(hex: 0xE8EDF5), fg: BAP.navy)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(contact.coachName ?? "").font(.bapCardTitle).foregroundColor(BAP.text).lineLimit(1)
                        Text([contact.coachRole, contact.coachEmail].compactMap { $0 }.joined(separator: " · "))
                            .font(.bapSecondary).foregroundColor(BAP.text3).lineLimit(1)
                    }
                    Spacer(minLength: 4)
                    VStack(alignment: .trailing, spacing: 4) {
                        Badge(text: contact.statusEnum.label, kind: contact.statusEnum.badge)
                        Text(DateUtil.relativeDays(contact.lastActivityAt)).font(.bapMeta).foregroundColor(BAP.text3)
                    }
                }
                if let next = contact.nextAction, !next.isEmpty {
                    HStack(spacing: 4) {
                        Text("次:").foregroundColor(BAP.text3)
                        Text(next).foregroundColor(BAP.text2)
                    }
                    .font(.bapSecondary).padding(.top, 10)
                }
            }
        }
    }
}

// MARK: - Add contact

struct AddContactView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var role = ""
    @State private var email = ""
    @State private var nextAction = ""
    @State private var status: ContactStatus = .none

    var body: some View {
        ScreenScroll {
            FormHeader(back: "コーチ連絡", title: "コーチを追加") { dismiss() }
            VStack(spacing: 14) {
                LabeledField(label: "コーチ名", placeholder: "Coach Smith", text: $name)
                LabeledField(label: "役職", placeholder: "Head Coach", text: $role)
                LabeledField(label: "メールアドレス", placeholder: "coach@university.edu", keyboard: .emailAddress, text: $email)
                LabeledField(label: "次のアクション", placeholder: "初回メールを送る", text: $nextAction)
                VStack(alignment: .leading, spacing: 6) {
                    Text("ステータス").font(.system(size: 12, weight: .semibold)).foregroundColor(BAP.text2)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(ContactStatus.allCases, id: \.self) { s in
                                FilterPill(title: s.label, selected: status == s) { status = s }
                            }
                        }
                    }
                }
                PrimaryButton(title: "保存する") {
                    guard !name.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                    Task {
                        await state.saveContact(name: name, role: role, email: email, status: status, nextAction: nextAction, note: "")
                        dismiss()
                    }
                }.padding(.top, 6)
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 20)
        }
        .navigationBarHidden(true)
    }
}

struct FormHeader: View {
    let back: String
    let title: String
    var action: () -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            BackChip(label: back, action: action)
            Text(title).font(.bapTitle).foregroundColor(BAP.text)
        }
        .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BAP.white)
        .overlay(Divider().background(BAP.border), alignment: .bottom)
    }
}
