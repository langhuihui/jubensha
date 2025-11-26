export const GAME_CONFIG = {
  // 游戏基本信息
  SCRIPT_ID: 'esther-story',
  GAME_NAME: '以斯帖记：王后的勇气',

  // 服务器配置
  // 动态获取 WebSocket 地址
  SERVER_URL: (() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `${protocol}//${host}/ws`
  })(),

  // 游戏阶段配置
  PHASES: [
    'character_introduction', // 角色介绍
    'palace_life',           // 宫廷生活
    'crisis_emerges',        // 危机降临
    'queen_decision',        // 王后的抉择
    'royal_banquet',         // 御前宴会
    'final_judgment'         // 最终审判
  ],

  // 游戏时间配置（分钟）
  PHASE_DURATION: {
    character_introduction: 10,
    palace_life: 15,
    crisis_emerges: 20,
    queen_decision: 15,
    royal_banquet: 20,
    final_judgment: 10
  },

  // 房间配置
  ROOM_CONFIG: {
    MIN_PLAYERS: 4,
    MAX_PLAYERS: 6,
    AUTO_START: false,
    OBSERVER_MODE: true
  },

  // 移动端配置
  MOBILE_CONFIG: {
    MAX_MESSAGE_LENGTH: 200,
    MAX_MESSAGES_PER_PAGE: 50,
    AUTO_SCROLL_DURATION: 300,
    TAP_VIBRATION: true
  },

  // 游戏规则
  GAME_RULES: {
    // 投票规则
    VOTE_TIMEOUT: 60, // 秒
    MIN_VOTE_PERCENTAGE: 0.5, // 最少投票比例

    // 线索规则
    MAX_CLUES_PER_PHASE: 2,
    CLUE_SHARE_COOLDOWN: 30, // 秒

    // 发言规则
    MAX_SPEAK_TIME: 120, // 秒
    SPEAK_ORDER: 'clockwise', // clockwise, random, host_control

    // 胜利条件
    VICTORY_CONDITIONS: {
      esther_win: '犹太人被拯救',
      haman_win: '哈曼的阴谋成功',
      neutral_win: '其他角色的特殊胜利条件'
    }
  },

  // 音效配置
  SOUND_CONFIG: {
    ENABLED: true,
    VOLUME: 0.7,
    EFFECTS: {
      phase_change: '/sounds/phase-change.mp3',
      message_received: '/sounds/message.mp3',
      clue_discovered: '/sounds/clue.mp3',
      vote_cast: '/sounds/vote.mp3',
      game_ended: '/sounds/game-end.mp3'
    }
  },

  // 动画配置
  ANIMATION_CONFIG: {
    ENABLED: true,
    DURATION: {
      FADE_IN: 300,
      FADE_OUT: 300,
      SLIDE_UP: 400,
      SLIDE_DOWN: 400,
      BOUNCE: 600
    }
  }
}

// 游戏状态枚举
export enum GameStatus {
  WAITING = 'waiting',     // 等待玩家
  PLAYING = 'playing',     // 游戏进行中
  PAUSED = 'paused',       // 游戏暂停
  ENDED = 'ended'         // 游戏结束
}

// 角色状态枚举
export enum CharacterStatus {
  ALIVE = 'alive',
  DEAD = 'dead',
  REVEALED = 'revealed'
}

// 线索类型配置
export const CLUE_TYPES = {
  document: {
    name: '文件',
    color: '#2196F3',
    icon: '📄'
  },
  testimony: {
    name: '证词',
    color: '#4CAF50',
    icon: '🗣️'
  },
  object: {
    name: '物品',
    color: '#FF9800',
    icon: '📦'
  },
  scene: {
    name: '现场',
    color: '#9C27B0',
    icon: '🏛️'
  }
}

// 错误消息
export const ERROR_MESSAGES = {
  ROOM_FULL: '房间已满',
  ROOM_NOT_FOUND: '房间不存在',
  INVALID_PASSWORD: '房间密码错误',
  GAME_ALREADY_STARTED: '游戏已经开始',
  PLAYER_NOT_FOUND: '玩家不存在',
  INSUFFICIENT_PLAYERS: '玩家数量不足',
  NETWORK_ERROR: '网络连接错误',
  INVALID_ACTION: '无效的操作'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  ROOM_CREATED: '房间创建成功',
  ROOM_JOINED: '加入房间成功',
  GAME_STARTED: '游戏开始',
  CLUE_DISCOVERED: '发现新线索',
  VOTE_CAST: '投票成功'
}