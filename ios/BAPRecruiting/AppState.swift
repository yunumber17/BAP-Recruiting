//
//  AppState.swift
//  BAP Recruiting
//
//  Single source of truth for routing + the signed-in player's data. Every
//  mutation writes to Supabase and then re-fetches, so the UI always reflects
//  the database (no memory-only state, no demo person).
//

import SwiftUI

@MainActor
final class AppState: ObservableObject {

    enum Route { case loading, auth, onboarding, app }

    // Routing
    @Published var route: Route = .loading

    // Player + data
    @Published var player: Player?
    @Published var tasks: [PlayerTask] = []
    @Published var events: [PlayerEvent] = []
    @Published var contacts: [CoachContact] = []
    @Published var messages: [CoachMessage] = []
    @Published var metrics: [Metric] = []
    @Published var goals: [Goal] = []
    @Published var documents: [RecruitingDocument] = []
    @Published var videos: [PlayerVideo] = []
    @Published var saved: [SavedCollege] = []
    @Published var scores: PlayerScores?

    // Locally tracked timeline progress (per device/account).
    @Published var timelineDone: Set<String> = []

    @Published var errorMessage: String?

    private let svc = SupabaseService.shared

    var savedIDs: Set<Int> { Set(saved.map { $0.collegeId }) }

    func messages(for contactID: String) -> [CoachMessage] {
        messages.filter { $0.contactId == contactID }
            .sorted { ($0.sentAt ?? "") < ($1.sentAt ?? "") }
    }

    // MARK: Boot

    func boot() async {
        if await svc.session() {
            await enterApp()
        } else {
            route = .auth
        }
    }

    func enterApp() async {
        do {
            if let row = try await svc.loadPlayer(), (row.name?.isEmpty == false) {
                player = row
                await reloadAll()
                route = .app
            } else {
                player = nil
                route = .onboarding
            }
        } catch {
            route = .onboarding
        }
    }

    // MARK: Auth

    func register(email: String, password: String) async -> String? {
        do {
            let signedIn = try await svc.signUp(email: email, password: password)
            if signedIn { route = .onboarding; return nil }
            return "確認メールを送信しました。リンクで認証後、ログインしてください。"
        } catch { return "登録に失敗しました: \(error.localizedDescription)" }
    }

    func login(email: String, password: String) async -> String? {
        do {
            try await svc.signIn(email: email, password: password)
            await enterApp()
            return nil
        } catch { return "ログインに失敗しました: \(error.localizedDescription)" }
    }

    func loginWithGoogle() async {
        try? await svc.signInWithGoogle()
    }

    func logout() async {
        await svc.signOut()
        player = nil
        route = .auth
    }

    // MARK: Data load

    func reloadAll() async {
        async let t = svc.loadTasks()
        async let e = svc.loadEvents()
        async let c = svc.loadContacts()
        async let m = svc.loadMessages()
        async let me = svc.loadMetrics()
        async let g = svc.loadGoals()
        async let d = svc.loadDocuments()
        async let v = svc.loadVideos()
        async let s = svc.loadSaved()
        async let sc = svc.loadScores()
        tasks = await t; events = await e; contacts = await c; messages = await m
        metrics = await me; goals = await g; documents = await d; videos = await v
        saved = await s; scores = await sc
    }

    // MARK: Onboarding + profile

    func finishOnboarding(name: String, school: String, position: String, year: String) async {
        let patch: [String: AnyJSON] = [
            "name": .string(name),
            "school": .string(school),
            "position": .string(position),
            "grad_year": Int(year).map { .double(Double($0)) } ?? .null,
        ]
        do {
            if let saved = try await svc.upsertPlayer(patch) { player = saved }
            await enterApp()
        } catch { errorMessage = "プロフィールの保存に失敗しました" }
    }

    func saveProfile(_ patch: [String: AnyJSON]) async {
        do {
            if let saved = try await svc.upsertPlayer(patch) { player = saved }
            await reloadAll()
        } catch { errorMessage = "プロフィールの保存に失敗しました" }
    }

    // MARK: Tasks

    func addTask(_ text: String) async {
        let t = text.trimmingCharacters(in: .whitespaces)
        guard !t.isEmpty else { return }
        try? await svc.insert("tasks", ["text": .string(t), "status": .string("open")])
        tasks = await svc.loadTasks()
    }

    func toggleTask(_ task: PlayerTask) async {
        let next = task.isDone ? "open" : "done"
        try? await svc.update("tasks", id: task.id, ["status": .string(next)])
        tasks = await svc.loadTasks()
    }

    func deleteTask(_ task: PlayerTask) async {
        try? await svc.delete("tasks", id: task.id)
        tasks = await svc.loadTasks()
    }

    // MARK: Goals

    func addGoal(label: String, current: String, target: String, unit: String) async {
        let row: [String: AnyJSON] = [
            "label": .string(label),
            "current_val": Double(current).map { .double($0) } ?? .null,
            "target_val": Double(target).map { .double($0) } ?? .null,
            "unit": unit.isEmpty ? .null : .string(unit),
        ]
        try? await svc.insert("improvement_goals", row)
        goals = await svc.loadGoals()
    }

    // MARK: Coach contacts

    func saveContact(name: String, role: String, email: String, status: ContactStatus, nextAction: String, note: String) async {
        let row: [String: AnyJSON] = [
            "coach_name": .string(name),
            "coach_role": role.isEmpty ? .null : .string(role),
            "coach_email": email.isEmpty ? .null : .string(email),
            "status": .string(status.rawValue),
            "next_action": nextAction.isEmpty ? .null : .string(nextAction),
            "note": note.isEmpty ? .null : .string(note),
            "last_activity_at": .string(ISO8601DateFormatter().string(from: Date())),
        ]
        try? await svc.insert("coach_contacts", row)
        contacts = await svc.loadContacts()
    }

    func setContactStatus(_ contact: CoachContact, _ status: ContactStatus) async {
        try? await svc.update("coach_contacts", id: contact.id, [
            "status": .string(status.rawValue),
            "last_activity_at": .string(ISO8601DateFormatter().string(from: Date())),
        ])
        contacts = await svc.loadContacts()
    }

    func deleteContact(_ contact: CoachContact) async {
        try? await svc.delete("coach_contacts", id: contact.id)
        contacts = await svc.loadContacts()
    }

    func logMessage(contactID: String, body: String, outbound: Bool) async {
        let b = body.trimmingCharacters(in: .whitespaces)
        guard !b.isEmpty else { return }
        try? await svc.insert("coach_messages", [
            "contact_id": .string(contactID),
            "direction": .string(outbound ? "outbound" : "inbound"),
            "body": .string(b),
            "sent_at": .string(ISO8601DateFormatter().string(from: Date())),
        ])
        try? await svc.update("coach_contacts", id: contactID, [
            "last_activity_at": .string(ISO8601DateFormatter().string(from: Date())),
        ])
        messages = await svc.loadMessages()
        contacts = await svc.loadContacts()
    }

    // MARK: Saved colleges

    func toggleSaved(_ college: College) async {
        if let existing = saved.first(where: { $0.collegeId == college.id }) {
            try? await svc.delete("saved_colleges", id: existing.id)
        } else {
            try? await svc.insert("saved_colleges", ["college_id": .double(Double(college.id))])
        }
        saved = await svc.loadSaved()
    }

    // MARK: Readiness (computed entirely from real data)

    struct ReadinessItem: Identifiable {
        let id: String
        let label: String
        let done: Bool
    }

    var readiness: [ReadinessItem] {
        let p = player
        func has(_ s: String?) -> Bool { (s?.isEmpty == false) }
        let toefl = documents.contains {
            ($0.kind == "toefl" || ($0.label?.lowercased().contains("toefl") ?? false)) && $0.status == "complete"
        }
        return [
            .init(id: "profile",  label: "プロフィール完成", done: has(p?.name) && has(p?.school) && (p?.gradYear != nil)),
            .init(id: "position", label: "ポジション登録",   done: has(p?.position)),
            .init(id: "physical", label: "身長・体重",       done: (p?.heightCm != nil) && (p?.weightKg != nil)),
            .init(id: "video",    label: "ハイライト動画",   done: !videos.isEmpty),
            .init(id: "toefl",    label: "TOEFLスコア",      done: toefl),
            .init(id: "college",  label: "志望校を選択",     done: !saved.isEmpty),
            .init(id: "coach",    label: "コーチへの連絡履歴", done: !contacts.isEmpty),
        ]
    }

    var readinessPct: Int {
        let l = readiness
        guard !l.isEmpty else { return 0 }
        return Int((Double(l.filter { $0.done }.count) / Double(l.count) * 100).rounded())
    }

    var profileCompletionPct: Int {
        let p = player
        let checks: [Bool] = [
            p?.name?.isEmpty == false, p?.school?.isEmpty == false, p?.position?.isEmpty == false,
            p?.gradYear != nil, p?.gpa != nil, p?.heightCm != nil, p?.weightKg != nil,
        ]
        return Int((Double(checks.filter { $0 }.count) / Double(checks.count) * 100).rounded())
    }

    var isFirstTime: Bool {
        tasks.isEmpty && contacts.isEmpty && messages.isEmpty
    }
}
