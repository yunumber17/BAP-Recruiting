//
//  SupabaseService.swift
//  BAP Recruiting
//
//  Thin wrapper around supabase-swift. All per-player rows are scoped to
//  player_id == auth.uid() and protected by Row Level Security on the backend.
//  Nothing is stored only in memory and there is no demo/mock person.
//
//  Add the package in Xcode:
//    File ▸ Add Packages… ▸ https://github.com/supabase/supabase-swift
//  Then fill in Secrets.swift with your project URL + anon key.
//

import Foundation
import Supabase

struct SupabaseConfig {
    // Fill these in (see Secrets.swift). The anon key is safe to ship in a
    // client app as long as RLS is enabled on every table.
    static let url = URL(string: Secrets.supabaseURL)!
    static let anonKey = Secrets.supabaseAnonKey
}

final class SupabaseService {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private init() {
        client = SupabaseClient(
            supabaseURL: SupabaseConfig.url,
            supabaseKey: SupabaseConfig.anonKey
        )
    }

    // MARK: Auth

    /// Resolve the signed-in user id from the live session (works across
    /// supabase-swift versions; no reliance on a synchronous accessor).
    func currentUserID() async -> String? {
        guard let session = try? await client.auth.session else { return nil }
        return session.user.id.uuidString.lowercased()
    }

    func session() async -> Bool {
        (try? await client.auth.session) != nil
    }

    @discardableResult
    func signUp(email: String, password: String) async throws -> Bool {
        let res = try await client.auth.signUp(email: email, password: password)
        return res.session != nil      // false ⇒ email confirmation required
    }

    func signIn(email: String, password: String) async throws {
        _ = try await client.auth.signIn(email: email, password: password)
    }

    func signOut() async {
        try? await client.auth.signOut()
    }

    func signInWithGoogle() async throws {
        try await client.auth.signInWithOAuth(provider: .google)
    }

    // MARK: Player

    func loadPlayer() async throws -> Player? {
        guard let uid = await currentUserID() else { return nil }
        let rows: [Player] = try await client
            .from("players").select().eq("id", value: uid).limit(1).execute().value
        return rows.first
    }

    func upsertPlayer(_ patch: [String: AnyJSON]) async throws -> Player? {
        guard let uid = await currentUserID() else { return nil }
        var row = patch
        row["id"] = .string(uid)
        let rows: [Player] = try await client
            .from("players").upsert(row).select().execute().value
        return rows.first
    }

    // MARK: Generic owned reads

    private func owned<T: Decodable>(_ table: String, as: T.Type) async -> [T] {
        guard let uid = await currentUserID() else { return [] }
        do {
            return try await client.from(table).select().eq("player_id", value: uid).execute().value
        } catch {
            print("[BAP] load \(table) error:", error)
            return []
        }
    }

    func loadTasks() async -> [PlayerTask]          { await owned("tasks", as: PlayerTask.self) }
    func loadEvents() async -> [PlayerEvent]         { await owned("events", as: PlayerEvent.self) }
    func loadContacts() async -> [CoachContact]      { await owned("coach_contacts", as: CoachContact.self) }
    func loadMessages() async -> [CoachMessage]      { await owned("coach_messages", as: CoachMessage.self) }
    func loadMetrics() async -> [Metric]             { await owned("performance_metrics", as: Metric.self) }
    func loadGoals() async -> [Goal]                 { await owned("improvement_goals", as: Goal.self) }
    func loadDocuments() async -> [RecruitingDocument] { await owned("recruiting_documents", as: RecruitingDocument.self) }
    func loadVideos() async -> [PlayerVideo]         { await owned("videos", as: PlayerVideo.self) }
    func loadSaved() async -> [SavedCollege]         { await owned("saved_colleges", as: SavedCollege.self) }

    func loadScores() async -> PlayerScores? {
        guard let uid = await currentUserID() else { return nil }
        do {
            let rows: [PlayerScores] = try await client
                .from("player_scores").select().eq("player_id", value: uid).limit(1).execute().value
            return rows.first
        } catch {
            print("[BAP] load player_scores error:", error)
            return nil
        }
    }

    // MARK: Generic owned writes

    func insert(_ table: String, _ row: [String: AnyJSON]) async throws {
        guard let uid = await currentUserID() else { throw BAPError.notAuthenticated }
        var r = row
        r["player_id"] = .string(uid)
        try await client.from(table).insert(r).execute()
    }

    func update(_ table: String, id: String, _ patch: [String: AnyJSON]) async throws {
        try await client.from(table).update(patch).eq("id", value: id).execute()
    }

    func delete(_ table: String, id: String) async throws {
        try await client.from(table).delete().eq("id", value: id).execute()
    }
}

enum BAPError: LocalizedError {
    case notAuthenticated
    var errorDescription: String? {
        switch self {
        case .notAuthenticated: return "ログインが必要です"
        }
    }
}
