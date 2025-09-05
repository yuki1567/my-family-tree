<template>
  <g class="relationship-line" :class="lineClasses">
    <!-- ベジェ曲線による関係線 -->
    <path
      :d="pathData"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="line-path"
    />
    
    <!-- 養子関係の場合は点線で表示 -->
    <path
      v-if="relationshipType === 'adopted'"
      :d="pathData"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-dasharray="5,5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="line-path-dashed"
    />
    
    <!-- 関係タイプインジケーター（線の中点付近） -->
    <circle
      v-if="showTypeIndicator"
      :cx="midPoint.x"
      :cy="midPoint.y"
      :r="4"
      :fill="strokeColor"
      class="type-indicator"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Position } from '@/types/components'

// Props
interface Props {
  parentPosition: Position
  childPosition: Position
  relationshipType: 'biological' | 'adopted'
  isHighlighted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isHighlighted: false
})

// Constants
const nodeHeight = 80
const controlPointOffset = 60 // ベジェ曲線の制御点オフセット

// Computed properties
const strokeColor = computed(() => {
  switch (props.relationshipType) {
    case 'biological':
      return props.isHighlighted ? 'var(--color-primary)' : '#22c55e' // 緑系
    case 'adopted':
      return props.isHighlighted ? 'var(--color-primary)' : 'var(--color-primary)' // オレンジ系
    default:
      return 'var(--color-border)'
  }
})

const strokeWidth = computed(() => {
  return props.isHighlighted ? 3 : 2
})

const lineClasses = computed(() => {
  return {
    'highlighted': props.isHighlighted,
    [`type-${props.relationshipType}`]: true
  }
})

const showTypeIndicator = computed(() => {
  return props.relationshipType === 'adopted'
})

// 線の開始点と終了点（ノードの境界から開始）
const startPoint = computed(() => {
  return {
    x: props.parentPosition.x,
    y: props.parentPosition.y + nodeHeight / 2 // ノードの下端
  }
})

const endPoint = computed(() => {
  return {
    x: props.childPosition.x,
    y: props.childPosition.y - nodeHeight / 2 // ノードの上端
  }
})

// ベジェ曲線の制御点
const controlPoint1 = computed(() => {
  return {
    x: startPoint.value.x,
    y: startPoint.value.y + controlPointOffset
  }
})

const controlPoint2 = computed(() => {
  return {
    x: endPoint.value.x,
    y: endPoint.value.y - controlPointOffset
  }
})

// SVG パスデータ（ベジェ曲線）
const pathData = computed(() => {
  if (props.relationshipType === 'adopted') {
    // 養子関係は実線なし（点線のみ）
    return ''
  }
  
  return `M ${startPoint.value.x} ${startPoint.value.y} 
          C ${controlPoint1.value.x} ${controlPoint1.value.y}, 
            ${controlPoint2.value.x} ${controlPoint2.value.y}, 
            ${endPoint.value.x} ${endPoint.value.y}`
})

// 線の中点（インジケーター表示用）
const midPoint = computed(() => {
  return {
    x: (startPoint.value.x + endPoint.value.x) / 2,
    y: (startPoint.value.y + endPoint.value.y) / 2
  }
})
</script>

<style scoped>
.relationship-line {
  pointer-events: none;
  transition: all 0.2s ease;
}

.line-path {
  transition: stroke 0.2s ease, stroke-width 0.2s ease;
}

.line-path-dashed {
  transition: stroke 0.2s ease, stroke-width 0.2s ease;
}

.type-indicator {
  transition: fill 0.2s ease;
}

.relationship-line.highlighted {
  filter: drop-shadow(0 0 4px currentColor);
}

.relationship-line.type-biological .line-path {
  opacity: 0.8;
}

.relationship-line.type-adopted .line-path-dashed {
  opacity: 0.8;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .line-path,
  .line-path-dashed {
    stroke-width: 1.5;
  }
  
  .relationship-line.highlighted .line-path,
  .relationship-line.highlighted .line-path-dashed {
    stroke-width: 2.5;
  }
  
  .type-indicator {
    r: 3;
  }
}
</style>