<template>
  <g 
    class="person-node"
    :class="nodeClasses"
    @click="onClick"
  >
    <!-- 人物ノード背景 -->
    <rect
      :x="position.x - nodeWidth / 2"
      :y="position.y - nodeHeight / 2"
      :width="nodeWidth"
      :height="nodeHeight"
      :fill="nodeFillColor"
      :stroke="nodeStrokeColor"
      :stroke-width="isSelected ? 3 : 1"
      rx="4"
      ry="4"
      class="node-background"
    />
    
    <!-- 写真またはイニシャル表示 -->
    <g class="person-avatar">
      <!-- 写真がある場合 -->
      <image
        v-if="person.photo"
        :x="position.x - avatarSize / 2"
        :y="position.y - nodeHeight / 2 + 8"
        :width="avatarSize"
        :height="avatarSize"
        :href="person.photo"
        class="person-photo"
      />
      
      <!-- 写真がない場合：イニシャル表示 -->
      <g v-else class="person-initials">
        <circle
          :cx="position.x"
          :cy="position.y - nodeHeight / 2 + 8 + avatarSize / 2"
          :r="avatarSize / 2"
          :fill="genderColor"
          opacity="0.8"
        />
        <text
          :x="position.x"
          :y="position.y - nodeHeight / 2 + 8 + avatarSize / 2"
          text-anchor="middle"
          dominant-baseline="central"
          class="initials-text"
          fill="white"
          font-size="16"
          font-weight="bold"
        >
          {{ initials }}
        </text>
      </g>
    </g>
    
    <!-- 名前表示 -->
    <text
      :x="position.x"
      :y="position.y + nodeHeight / 2 - 20"
      text-anchor="middle"
      class="person-name"
      fill="var(--color-text)"
      font-size="12"
      font-weight="500"
    >
      {{ displayName }}
    </text>
    
    <!-- 生年・没年表示 -->
    <text
      v-if="lifespanText"
      :x="position.x"
      :y="position.y + nodeHeight / 2 - 6"
      text-anchor="middle"
      class="person-lifespan"
      fill="var(--color-text-secondary)"
      font-size="10"
    >
      {{ lifespanText }}
    </text>
    
    <!-- 性別インジケーター -->
    <circle
      :cx="position.x + nodeWidth / 2 - 12"
      :cy="position.y - nodeHeight / 2 + 12"
      r="6"
      :fill="genderColor"
      class="gender-indicator"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Person, Position } from '@/types/components'

// Props
interface Props {
  person: Person
  position: Position
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

// Emits
const emit = defineEmits<{
  click: [person: Person]
}>()

// Constants (matches CSS variables)
const nodeWidth = 120
const nodeHeight = 80
const avatarSize = 32

// Computed properties
const displayName = computed(() => {
  return props.person.name || '不明'
})

const initials = computed(() => {
  if (props.person.name) {
    const names = props.person.name.split(' ').filter(n => n.length > 0)
    if (names.length >= 2 && names[0] && names[1]) {
      return names[0].charAt(0) + names[1].charAt(0)
    } else if (names.length === 1 && names[0]) {
      return names[0].charAt(0)
    }
  }
  return props.person.gender === 'male' ? '父' : props.person.gender === 'female' ? '母' : '？'
})

const genderColor = computed(() => {
  switch (props.person.gender) {
    case 'male':
      return 'var(--color-male)'
    case 'female':
      return 'var(--color-female)'
    default:
      return 'var(--color-unknown)'
  }
})

const nodeFillColor = computed(() => {
  return props.isSelected ? 'var(--color-surface)' : 'var(--color-background)'
})

const nodeStrokeColor = computed(() => {
  return props.isSelected ? 'var(--color-primary)' : 'var(--color-border)'
})

const lifespanText = computed(() => {
  const birth = props.person.birthDate ? formatDate(props.person.birthDate) : ''
  const death = props.person.deathDate ? formatDate(props.person.deathDate) : ''
  
  if (birth && death) {
    return `${birth} - ${death}`
  } else if (birth) {
    return `${birth} -`
  } else if (death) {
    return `- ${death}`
  }
  return ''
})

const nodeClasses = computed(() => {
  return {
    'selected': props.isSelected,
    [`gender-${props.person.gender || 'unknown'}`]: true
  }
})

// Helper functions
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}/${month}/${day}`
  } catch {
    return dateString
  }
}

// Event handlers
const onClick = (event: MouseEvent) => {
  event.stopPropagation()
  emit('click', props.person)
}
</script>

<style scoped>
.person-node {
  cursor: pointer;
  transition: all 0.2s ease;
}

.person-node:hover .node-background {
  filter: brightness(0.95);
}

.person-node.selected .node-background {
  filter: brightness(1.05);
}

.person-photo {
  border-radius: 4px;
}

.initials-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  user-select: none;
}

.person-name {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  user-select: none;
}

.person-lifespan {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  user-select: none;
}

.gender-indicator {
  opacity: 0.8;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .person-name {
    font-size: 11px;
  }
  
  .person-lifespan {
    font-size: 9px;
  }
  
  .initials-text {
    font-size: 14px;
  }
}
</style>