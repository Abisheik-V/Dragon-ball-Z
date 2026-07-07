import gokuModel from '../assets/3D Models/gokucharacter3dmodel.glb';
import vegetaModel from '../assets/3D Models/thesaiyajin_-_vegeta_bodyguard.glb';
import trunksModel from '../assets/3D Models/trunkz_dragon_ball_z__0721210019_texture.glb';
import jirenModel from '../assets/3D Models/jiren_the_gray_dragon_ball_super_dbz_free_model.glb';

export const characters = [
  {
    id: 'goku',
    name: 'Son Goku',
    title: 'The Legendary Super Saiyan',
    race: 'Saiyan (Kakarot)',
    affiliation: 'Z Fighters / Turtle School',
    firstAppearance: 'Dragon Ball Chapter 1 / Episode 1',
    voiceActor: 'Masako Nozawa (JP) / Sean Schemmel (EN)',
    basePowerLevel: 9001,
    biography: 'Sent to Earth as an infant with the mission to conquer it, Kakarot suffered a head injury that wiped his aggressive Saiyan programming. Raised as Son Goku by Grandpa Gohan, he grew up to become Earth\'s greatest defender, constantly seeking to push his limits and face stronger opponents across the multiverse.',
    modelPath: gokuModel,
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    defaultLightColor: '#ffbb66',
    forms: [
      {
        id: 'base',
        name: 'Base Form',
        auraColor: '#ffffff',
        auraIntensity: 0.4,
        accentColor: '#FF6B00',
        glowStyle: 'rgba(255, 107, 0, 0.4)',
        stats: { power: 75, ki: 78, speed: 82, defense: 75, technique: 92 },
        description: 'Goku\'s natural state. Relaxed but ready for action, allowing him to conserve energy and utilize techniques like Kaio-ken and the Spirit Bomb.'
      },
      {
        id: 'ssj',
        name: 'Super Saiyan',
        auraColor: '#ffd700',
        auraIntensity: 1.2,
        accentColor: '#FFE500',
        glowStyle: 'rgba(255, 229, 0, 0.6)',
        stats: { power: 90, ki: 91, speed: 92, defense: 88, technique: 94 },
        description: 'Triggered by intense anger on Namek. Hair turns golden and power multiplies fifty-fold, radiating a fierce yellow aura.'
      },
      {
        id: 'ssb',
        name: 'Super Saiyan Blue',
        auraColor: '#00dfff',
        auraIntensity: 1.6,
        accentColor: '#00A3FF',
        glowStyle: 'rgba(0, 163, 255, 0.7)',
        stats: { power: 98, ki: 99, speed: 97, defense: 95, technique: 97 },
        description: 'Super Saiyan God Super Saiyan. Combines the godly power of Super Saiyan God with the Super Saiyan transformation, requiring absolute Ki control.'
      },
      {
        id: 'ui',
        name: 'Ultra Instinct',
        auraColor: '#e0e0ff',
        auraIntensity: 2.2,
        accentColor: '#a2a2d0',
        glowStyle: 'rgba(224, 224, 255, 0.9)',
        stats: { power: 100, ki: 100, speed: 100, defense: 100, technique: 99 },
        description: 'The state of the gods. Goku\'s body reacts automatically to threats without the need for conscious thought, granting flawless evasion and attack speed.'
      }
    ],
    moves: [
      {
        name: 'Kamehameha',
        description: 'Goku\'s signature energy blast, learned from Master Roshi. Cupped hands are drawn to the side to concentrate Ki before firing.',
        soundType: 'kamehameha'
      },
      {
        name: 'Instant Transmission',
        description: 'A technique for teleporting, learned on Planet Yardrat. By placing index and middle fingers on his forehead, Goku can lock onto a Ki signature and teleport instantly.',
        soundType: 'teleport'
      },
      {
        name: 'Spirit Bomb',
        description: 'Goku gathers life energy from surrounding organisms, forming a massive, highly destructive sphere of pure energy.',
        soundType: 'spirit'
      }
    ]
  },
  {
    id: 'vegeta',
    name: 'Prince Vegeta',
    title: 'Prince of all Saiyans',
    race: 'Saiyan (Vegeta IV)',
    affiliation: 'Z Fighters / Capsule Corp',
    firstAppearance: 'Dragon Ball Z Episode 5',
    voiceActor: 'Ryo Horikawa (JP) / Christopher Sabat (EN)',
    basePowerLevel: 8999,
    biography: 'The proud and ruthless Prince of the Saiyans. Initially arriving on Earth to destroy it and obtain the Dragon Balls, his encounters with Goku sparked a lifelong rivalry. Over time, Vegeta chose to call Earth home, raising a family while relentlessly training to surpass his eternal rival Kakarot.',
    modelPath: vegetaModel,
    scale: 0.95,
    position: [0, 0, 0],
    rotation: [0, 0.5, 0],
    defaultLightColor: '#55aaff',
    forms: [
      {
        id: 'base',
        name: 'Base Form',
        auraColor: '#a0c0ff',
        auraIntensity: 0.4,
        accentColor: '#0055ff',
        glowStyle: 'rgba(0, 85, 255, 0.4)',
        stats: { power: 76, ki: 75, speed: 80, defense: 78, technique: 88 },
        description: 'Vegeta\'s standard form. Calculated and precise, utilizing tactical combat knowledge to dismantle opponents.'
      },
      {
        id: 'ssj',
        name: 'Super Saiyan',
        auraColor: '#ffd700',
        auraIntensity: 1.2,
        accentColor: '#FFE500',
        glowStyle: 'rgba(255, 229, 0, 0.6)',
        stats: { power: 89, ki: 88, speed: 90, defense: 87, technique: 90 },
        description: 'Achieved through sheer frustration and desire to surpass Goku. Wields the trademark golden hair and explosive Saiyan power.'
      },
      {
        id: 'ssb',
        name: 'Super Saiyan Blue',
        auraColor: '#0088ff',
        auraIntensity: 1.7,
        accentColor: '#0044ff',
        glowStyle: 'rgba(0, 68, 255, 0.7)',
        stats: { power: 97, ki: 96, speed: 96, defense: 94, technique: 95 },
        description: 'Super Saiyan Blue form pushed to its limits. Yields a deeper royal blue shade, reflecting Vegeta\'s fierce resolve and unyielding pride.'
      },
      {
        id: 'ego',
        name: 'Ultra Ego',
        auraColor: '#d000ff',
        auraIntensity: 2.3,
        accentColor: '#9d00ff',
        glowStyle: 'rgba(157, 0, 255, 0.9)',
        stats: { power: 100, ki: 99, speed: 98, defense: 100, technique: 94 },
        description: 'A power attained through training under Beerus. Powered by raw combat instinct and destruction, Vegeta grows stronger the more damage he absorbs.'
      }
    ],
    moves: [
      {
        name: 'Final Flash',
        description: 'Vegeta\'s ultimate energy wave. He spreads his arms wide to gather massive amounts of Ki, then brings his hands together to fire a colossal golden beam.',
        soundType: 'finalflash'
      },
      {
        name: 'Big Bang Attack',
        description: 'Vegeta extends his arm, opens his palm, and fires a single, high-density blue sphere of Ki that explodes violently upon impact.',
        soundType: 'bigbang'
      },
      {
        name: 'Galick Gun',
        description: 'A classic purple energy wave. Vegeta curls his fingers and places both hands near his chest, charging purple Ki before thrusting them forward.',
        soundType: 'galick'
      }
    ]
  },
  {
    id: 'trunks',
    name: 'Future Trunks',
    title: 'Warrior from the Ruined Future',
    race: 'Saiyan-Human Hybrid',
    affiliation: 'Capsule Corp (Future) / Resistance',
    firstAppearance: 'Dragon Ball Z Episode 119',
    voiceActor: 'Takeshi Kusao (JP) / Eric Vale (EN)',
    basePowerLevel: 6500,
    biography: 'The son of Vegeta and Bulma from a dark post-apocalyptic future where Androids 17 and 18 slaughtered the Z Fighters. Trained by Future Gohan, Trunks traveled back in time to alter the course of history, warn Goku of the impending threat, and save both timelines.',
    modelPath: trunksModel,
    scale: 0.95,
    position: [0, 0, 0],
    rotation: [0, -0.3, 0],
    defaultLightColor: '#ffddaa',
    forms: [
      {
        id: 'base',
        name: 'Base Form',
        auraColor: '#e0f0ff',
        auraIntensity: 0.3,
        accentColor: '#bc9cff',
        glowStyle: 'rgba(188, 156, 255, 0.4)',
        stats: { power: 68, ki: 70, speed: 76, defense: 72, technique: 85 },
        description: 'Trunks in his base state. A highly disciplined swordsman who relies on agility, tactics, and his trusty alloy blade.'
      },
      {
        id: 'ssj',
        name: 'Super Saiyan',
        auraColor: '#ffd700',
        auraIntensity: 1.1,
        accentColor: '#FFE500',
        glowStyle: 'rgba(255, 229, 0, 0.6)',
        stats: { power: 84, ki: 83, speed: 88, defense: 81, technique: 88 },
        description: 'Unlocked after the tragic death of his mentor Gohan. Dramatically enhances his combat power and infuses his sword attacks with golden Ki.'
      },
      {
        id: 'rage',
        name: 'Super Saiyan Rage',
        auraColor: '#ffa500',
        auraIntensity: 1.8,
        accentColor: '#ff8c00',
        glowStyle: 'rgba(255, 140, 0, 0.8)',
        stats: { power: 93, ki: 94, speed: 92, defense: 90, technique: 91 },
        description: 'Achieved during the conflict with Goku Black. Combining golden Super Saiyan Ki with a violent blue inner aura of pure anger, matching Goku Black\'s strength.'
      }
    ],
    moves: [
      {
        name: 'Burning Attack',
        description: 'Trunks performs a rapid series of complex hand gestures before thrusting his palms forward to unleash a powerful ball of orange fire-like energy.',
        soundType: 'burning'
      },
      {
        name: 'Shining Sword Attack',
        description: 'A lethal combo. Trunks charges with his sword, slashes the opponent to pieces at high speed, and finishes them off with a point-blank energy blast.',
        soundType: 'sword'
      }
    ]
  },
  {
    id: 'jiren',
    name: 'Jiren the Gray',
    title: 'The Unrivaled Mighty Mortal',
    race: 'Unknown',
    affiliation: 'Pride Troopers (Universe 11)',
    firstAppearance: 'Dragon Ball Super Episode 85',
    voiceActor: 'Yukinori Okata (JP) / Patrick Seitz (EN)',
    basePowerLevel: 11000,
    biography: 'A member of the Pride Troopers, a peace-keeping hero team of Universe 11. Haunted by the childhood tragedy of his master and friends being killed by a demon, Jiren abandoned trust and team-up battle, believing that "Strength is absolute justice." His power exceeds that of a God of Destruction.',
    modelPath: jirenModel,
    scale: 1.1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    defaultLightColor: '#ff7777',
    forms: [
      {
        id: 'base',
        name: 'Pride Trooper',
        auraColor: '#ff4444',
        auraIntensity: 0.8,
        accentColor: '#FF2E2E',
        glowStyle: 'rgba(255, 46, 46, 0.5)',
        stats: { power: 96, ki: 95, speed: 96, defense: 98, technique: 92 },
        description: 'Jiren\'s standard state. He emits an intense, burning red aura, capable of deflecting high-level attacks with just his Ki glare.'
      },
      {
        id: 'full',
        name: 'Super Full Power',
        auraColor: '#ff2200',
        auraIntensity: 2.2,
        accentColor: '#e60000',
        glowStyle: 'rgba(230, 0, 0, 0.9)',
        stats: { power: 100, ki: 100, speed: 99, defense: 100, technique: 96 },
        description: 'Jiren unlocks his inner volcanic power by breaking his limits. His aura becomes an exploding solar flare of pure, condensed power, burning with raw energy.'
      }
    ],
    moves: [
      {
        name: 'Power Impact',
        description: 'Jiren fires a reddish-orange Ki sphere that starts small, then expands into a massive explosion upon contact, trapping opponents in its thermal blast.',
        soundType: 'impact'
      },
      {
        name: 'Colossal Slash',
        description: 'Jiren throws a swift, invisible punches that manifest as colossal, red energy shockwaves cutting through space itself.',
        soundType: 'glare'
      }
    ]
  }
];
