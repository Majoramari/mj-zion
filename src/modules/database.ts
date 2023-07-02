import { Database as Sqlite, Statement } from "bun:sqlite";
import { Match } from "../types";

/**
 * Represents a database module for tracking 1v1 matches.
 */
export class Database {
	private db: Sqlite;

	/**
	 * Constructs a new Database instance.
	 * @param dbPath The path to the SQLite database file.
	 */
	constructor(dbPath: string) {
		this.db = new Sqlite(dbPath);
		this.initializeDatabase();
	}

	/**
	 * Initializes the database by creating the necessary tables if they don't exist.
	 */
	private initializeDatabase(): void {
		this.db.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        matchId TEXT PRIMARY KEY,
        game TEXT,
        winnerId TEXT,
        defeatedId TEXT,
        isConfirmed INTEGER
      );
    `);
	}

	/**
	 * Builds the matchId based on the game, winnerId, and defeatedId.
	 * @param game The game of the match.
	 * @param winnerId The ID of the winner.
	 * @param defeatedId The ID of the defeated player.
	 * @returns The constructed matchId.
	 */
	public buildMatchId(game: string, winnerId: string, defeatedId: string): string {
		const winnerHalf = winnerId.substr(0, Math.ceil(winnerId.length / 2));
		const defeatedHalf = defeatedId.substr(0, Math.ceil(defeatedId.length / 2));
		return `jmari-${game}-${winnerHalf}-${defeatedHalf}`;
	}

	/**
	 * Records a new match in the database.
	 * @param match The match details to record.
	 * @returns The recorded match.
	 */
	public recordMatch(match: {
		game: string;
		winnerId: string;
		defeatedId: string;
		isConfirmed?: boolean;
	}): Match {
		const { game, winnerId, defeatedId, isConfirmed = false } = match;

		// Check if the match already exists
		const existingMatch = this.hasPlayedBefore(game, winnerId, defeatedId);
		if (existingMatch) {
			return existingMatch;
		}

		const matchId = this.buildMatchId(game, winnerId, defeatedId);

		this.db
			.prepare("INSERT INTO matches VALUES (?, ?, ?, ?, ?)")
			.run(matchId, game, winnerId, defeatedId, isConfirmed ? 1 : 0);

		return {
			matchId,
			game,
			winnerId,
			defeatedId,
			isConfirmed,
		};
	}

	/**
	 * Checks if a match with the same game, winnerId, and defeatedId has been recorded before.
	 * @param game The game of the match.
	 * @param playerOne The ID of player one.
	 * @param playerTwo The ID of player two.
	 * @returns The existing match if found, or null otherwise.
	 */
	public hasPlayedBefore(game: string, playerOne: string, playerTwo: string): Match | null {
		const statement: Statement = this.db.prepare(`
      SELECT * FROM matches
      WHERE game = ? AND ((winnerId = ? AND defeatedId = ?) OR (winnerId = ? AND defeatedId = ?))
      LIMIT 1;
    `);

		const result = statement.get(game, playerOne, playerTwo, playerTwo, playerOne);

		return result ? this.rowToMatch(result) : null;
	}

	/**
	 * Retrieves all matches associated with a player.
	 * @param playerId The ID of the player.
	 * @returns An array of matches associated with the player.
	 */
	public getPlayerMatches(playerId: string): Match[] {
		const statement: Statement = this.db.prepare(`
      SELECT * FROM matches
      WHERE winnerId = ? OR defeatedId = ?;
    `);

		const results = statement.all(playerId, playerId);

		return results.map(this.rowToMatch);
	}

	/**
	 * Retrieves a match by its matchId.
	 * @param matchId The ID of the match.
	 * @returns The match if found, or null otherwise.
	 */
	public getMatchById(matchId: string): Match | null {
		const statement: Statement = this.db.prepare(`
      SELECT * FROM matches
      WHERE matchId = ?
      LIMIT 1;
    `);

		const result = statement.get(matchId);

		return result ? this.rowToMatch(result) : null;
	}

	/**
	 * Retrieves a match by the game and the IDs of the two players.
	 * @param game The game of the match.
	 * @param playerOne The ID of player one.
	 * @param playerTwo The ID of player two.
	 * @returns The match if found, or null otherwise.
	 */
	public getMatchByPlayers(game: string, playerOne: string, playerTwo: string): Match | null {
		const statement: Statement = this.db.prepare(`
      SELECT * FROM matches
      WHERE game = ? AND ((winnerId = ? AND defeatedId = ?) OR (winnerId = ? AND defeatedId = ?))
      LIMIT 1;
    `);

		const result = statement.get(game, playerOne, playerTwo, playerTwo, playerOne);

		return result ? this.rowToMatch(result) : null;
	}

	/**
	 * Sets the isConfirmed flag for a match.
	 * @param matchId The ID of the match.
	 * @param isConfirmed The confirmation status of the match.
	 * @returns The updated match if found, or null otherwise.
	 */
	public setMatchConfirmation(matchId: string, isConfirmed: boolean): Match | null {
		const statement: Statement = this.db.prepare(`
      UPDATE matches SET isConfirmed = ? WHERE matchId = ?;
    `);

		statement.run(isConfirmed ? 1 : 0, matchId);

		const result = this.getMatchById(matchId);
		return result ? this.rowToMatch(result) : null;
	}

	/**
	 * Retrieves the player's score (number of confirmed wins) in a specific game.
	 * @param playerId The ID of the player.
	 * @param game The game to retrieve the score for.
	 * @returns The player's score in the game.
	 */
	public getPlayerScore(playerId: string, game: string): number {
		const statement: Statement = this.db.prepare(`
      SELECT COUNT(*) AS score
      FROM matches
      WHERE game = ? AND winnerId = ? AND isConfirmed = 1;
    `);

		const result = statement.get(game, playerId) as { score: number };

		return result.score || 0;
	}

	/**
	 * Retrieves the player's score, considering 2 points for wins and 1 point for defeats in confirmed matches.
	 * @param playerId The ID of the player.
	 * @param game The game to retrieve the score for.
	 * @returns An object containing the number of wins, defeats, and the combined score.
	 */
	public getPlayerScoreWithDefeats(
		playerId: string,
		game: string
	): { wins: number; defeats: number; score: number } {
		const statement: Statement = this.db.prepare(`
    SELECT
      SUM(CASE WHEN winnerId = ? THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN defeatedId = ? THEN 1 ELSE 0 END) AS defeats,
      SUM(CASE WHEN winnerId = ? THEN 2 ELSE 1 END) AS score
    FROM matches
    WHERE game = ? AND isConfirmed = 1 AND (winnerId = ? OR defeatedId = ?);
  `);

		const result = statement.get(playerId, playerId, playerId, game, playerId, playerId) as {
			wins: number;
			defeats: number;
			score: number;
		};

		return {
			wins: result.wins || 0,
			defeats: result.defeats || 0,
			score: result.score || 0,
		};
	}

	/**
	 * Retrieves the top 15 players with the highest score in a specific game, considering only confirmed matches.
	 * @param game The game to retrieve the top players for.
	 * @returns An array of players with their corresponding scores, sorted in descending order.
	 */
	public getTopPlayers(game: string): { playerId: string; score: number }[] {
		const statement: Statement = this.db.prepare(`
      SELECT winnerId AS playerId, COUNT(*) AS score
      FROM matches
      WHERE game = ? AND isConfirmed = 1
      GROUP BY winnerId
      ORDER BY score DESC
      LIMIT 15;
    `);

		const results = statement.all(game) as { playerId: string; score: number }[];

		return results;
	}

	/**
	 * Deletes a match by its matchId if it is an unconfirmed match.
	 * @param matchId The ID of the match to delete.
	 * @returns The deleted match if it was an unconfirmed match and was successfully deleted, or null otherwise.
	 */
	public deleteMatchById(matchId: string): Match | null {
		const statement: Statement = this.db.prepare(`
    DELETE FROM matches
    WHERE matchId = ? AND isConfirmed = 0;
  `);

		const existingMatch = this.getMatchById(matchId);
		if (existingMatch && !existingMatch.isConfirmed) {
			statement.run(matchId);
			return existingMatch;
		}

		return null;
	}

	/**
	 * Converts a database row object to a Match object.
	 * @param row The row object retrieved from the database.
	 * @returns The converted Match object.
	 */
	private rowToMatch(row: any): Match {
		return {
			matchId: row.matchId,
			game: row.game,
			winnerId: row.winnerId,
			defeatedId: row.defeatedId,
			isConfirmed: row.isConfirmed === 1,
		};
	}
}
