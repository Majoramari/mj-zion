/**
 * Represents a match in the database.
 */
export interface Match {
	matchId: string;
	game: string;
	winnerId: string;
	defeatedId: string;
	isConfirmed: boolean;
}
