# Wake Codex7 Teams

Wake all Codex7 package teams for parallel development using iris-mcp orchestration.

## Purpose

This command wakes all `team-codex7-*` teams sequentially to prepare them for parallel development sessions. Each team corresponds to a package in the Codex7 monorepo and will work on implementing their package-specific PLAN.md files.

## Important Constraints

**CRITICAL**: Claude Code can only launch ONE Claude session at a time due to VM constraints. You MUST wake teams sequentially, waiting for each team to fully wake before proceeding to the next.

❌ **DO NOT** call multiple `team_wake` operations in parallel
✅ **DO** call them one at a time, waiting for each to complete

## Workflow

### Step 1: List All Teams

Use `mcp__iris__list_teams` to retrieve all configured teams.

### Step 2: Filter Codex7 Teams

From the team list, identify all teams matching the pattern `team-codex7-*` (excluding the base `team-codex7` team).

Expected teams:
- `team-codex7-shared` - Foundation package
- `team-codex7-storage` - PostgreSQL + pgvector adapter
- `team-codex7-mcp` - MCP server
- `team-codex7-api` - REST API
- `team-codex7-web` - React UI
- `team-codex7-indexer` - Background indexer

### Step 3: Wake Teams Sequentially

For each team in the filtered list:

1. Call `mcp__iris__team_wake` with:
   - `team`: The team name (e.g., `team-codex7-shared`)
   - `fromTeam`: Always use `"team-codex7"` (this session's team name)

2. **WAIT** for the wake operation to complete successfully before proceeding to the next team

3. Report the session ID and status for each team

4. If a team is already awake, that's fine - continue to the next team

### Step 4: Report Status

After all teams have been processed, provide a summary:
- Total teams found
- Teams successfully awakened (with session IDs)
- Teams already awake
- Any failures

## Example Execution

```
Step 1: Listing all iris-mcp teams...
Found 18 total teams, 6 are Codex7 package teams.

Step 2: Waking Codex7 teams sequentially...

Waking team-codex7-shared...
✅ Session: 01106420-9707-42b7-9f03-d340e131ea7c (32s)

Waking team-codex7-storage...
✅ Session: 8f3a2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c (36s)

Waking team-codex7-mcp...
✅ Session: 459bd3b2-5127-4711-b5ef-77eea0f6610e (34s)

Waking team-codex7-api...
✅ Session: 0f9241df-84da-496b-a22e-3d15c2c4077b (33s)

Waking team-codex7-web...
✅ Session: 17727bde-7bae-44bb-bce4-d43c75c52fae (47s)

Waking team-codex7-indexer...
✅ Session: 51d973d9-b98f-4142-bbd1-11fdaff58021 (46s)

Step 3: All teams awakened successfully! 🎉

Summary:
- 6 teams found
- 6 teams awakened
- 0 already awake
- 0 failures
- Total time: ~3-4 minutes
```

## Error Handling

If a team fails to wake:
- Report the error clearly
- Continue with the remaining teams (don't stop the entire process)
- Include failed teams in the final summary

## Notes

- The base `team-codex7` team (this session) should NOT be awakened
- Each wake operation takes 30-50 seconds due to VM initialization
- Total execution time will be approximately 3-4 minutes for all 6 teams
- Teams remain awake until explicitly put to sleep or iris-mcp restarts
- Use `/team-status` to check which teams are currently awake

## Related Commands

- `/team-status` - Check status of all teams
- `/sleep-teams` - Put Codex7 teams to sleep (future command)
- `/message-team` - Send messages to awakened teams

---

**Usage**: Simply run `/wake-team` to wake all Codex7 package teams sequentially.
