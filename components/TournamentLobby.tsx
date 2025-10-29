import React from 'react';
import { useStore } from '../store';
import { GameState, Boss, League } from '../types';
import { characterService } from '../services/characterService';
import CharacterDisplay from './CharacterDisplay';

const BossCard: React.FC<{ boss: Boss }> = ({ boss }) => {
    const { playerCharacter, startBossBattle } = useStore();

    const isDefeated = playerCharacter.defeatedBosses.includes(boss.id);
    const meetsRunning = playerCharacter.running >= boss.skillRequirements.running;
    const meetsSwimming = playerCharacter.swimming >= boss.skillRequirements.swimming;
    const meetsFlying = playerCharacter.flying >= boss.skillRequirements.flying;
    const hasEnoughCoins = playerCharacter.coins >= boss.entryFee;
    const canChallenge = meetsRunning && meetsSwimming && meetsFlying && hasEnoughCoins && !isDefeated;

    const SkillRequirement: React.FC<{ label: string, current: number, required: number }> = ({ label, current, required }) => {
        const hasSkill = current >= required;
        return (
            <div className={`flex justify-between text-sm ${hasSkill ? '' : 'text-red-600'}`}>
                <span>{label}:</span>
                <span className="font-bold">{current} / {required}</span>
            </div>
        );
    };

    return (
        <div className={`card flex flex-col items-center gap-4 relative ${isDefeated ? 'opacity-50 bg-[#e9ddb8]' : ''}`}>
            {isDefeated && <div className="absolute top-2 right-2 text-2xl" aria-label="Defeated">✅</div>}
            <CharacterDisplay character={boss.character} />
            <h3 className="text-2xl font-bold">{boss.name}</h3>
            <div className="bg-[#e9ddb8] p-3 rounded-lg w-full text-left space-y-1 border-2 border-[var(--dl-text)]">
                <div className="flex justify-around text-center mb-2">
                    <p>WPM: <span className="font-bold">{boss.wpm}</span></p>
                    <p>Fee: <span className={`font-bold ${hasEnoughCoins ? '' : 'text-red-600'}`}>{boss.entryFee} 🪙</span></p>
                </div>
                <SkillRequirement label="Running" current={playerCharacter.running} required={boss.skillRequirements.running} />
                <SkillRequirement label="Swimming" current={playerCharacter.swimming} required={boss.skillRequirements.swimming} />
                <SkillRequirement label="Flying" current={playerCharacter.flying} required={boss.skillRequirements.flying} />
            </div>
            <button
                onClick={() => startBossBattle(boss.id)}
                disabled={!canChallenge}
                className="btn btn-primary w-full"
            >
                {isDefeated ? 'Defeated' : 'Challenge'}
            </button>
        </div>
    );
};

const LeagueSection: React.FC<{ league: League }> = ({ league }) => {
    return (
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--dl-yellow-shadow)] mb-4 border-b-2 border-[var(--dl-dirt)] pb-2">{league.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {league.bosses.map(boss => <BossCard key={boss.id} boss={boss} />)}
            </div>
        </div>
    )
};

const TournamentLobby: React.FC = () => {
    const { setGameState } = useStore();
    const leagues = characterService.leagues;

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold">Championship</h1>
                <p className="opacity-80 text-lg mt-2">Defeat all the bosses to reassemble the Golden Keyboard!</p>
            </div>
            <div className="mb-8">
                {leagues.map(league => <LeagueSection key={league.id} league={league} />)}
            </div>
            <div className="text-center">
                <button onClick={() => setGameState(GameState.ADVENTURE_MAP)} className="btn btn-secondary">
                    Back to Map
                </button>
            </div>
        </div>
    );
};

export default TournamentLobby;