<template>
  <div class="family-tree-container">
    <svg 
      ref="svgCanvas"
      class="family-tree-svg"
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
      @click="onCanvasClick"
    >
      <!-- 背景グリッド（開発用・非表示可能） -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- 関係線レイヤー（人物ノードより下に描画） -->
      <g class="relationships-layer">
        <RelationshipLine
          v-for="relationship in relationships"
          :key="`${relationship.parentId}-${relationship.childId}`"
          :parent-position="getPersonPosition(relationship.parentId)"
          :child-position="getPersonPosition(relationship.childId)"
          :relationship-type="relationship.type"
        />
      </g>
      
      <!-- 人物ノードレイヤー -->
      <g class="persons-layer">
        <PersonNode
          v-for="person in people"
          :key="person.id"
          :person="person"
          :position="getPersonPosition(person.id)"
          :is-selected="selectedPersonId === person.id"
          @click="onPersonClick"
        />
      </g>
    </svg>
    
    <!-- ズーム・パン操作コントロール -->
    <div class="tree-controls">
      <AppButton
        variant="secondary"
        size="small"
        @click="zoomIn"
        :disabled="zoomLevel >= 2"
      >
        +
      </AppButton>
      <AppButton
        variant="secondary"
        size="small"
        @click="zoomOut"
        :disabled="zoomLevel <= 0.5"
      >
        -
      </AppButton>
      <AppButton
        variant="secondary"
        size="small"
        @click="resetView"
      >
        リセット
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Person, Relationship, Position } from '@/types/components'

// Props
interface Props {
  people?: Person[]
  relationships?: Relationship[]
}

const props = withDefaults(defineProps<Props>(), {
  people: () => [],
  relationships: () => []
})

// Emits
const emit = defineEmits<{
  personClick: [person: Person]
  canvasClick: [event: MouseEvent]
}>()

// Reactive state
const svgCanvas = ref<SVGElement>()
const selectedPersonId = ref<string>()
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)

// SVG ViewBox calculation
const viewBox = computed(() => {
  const width = 800 * (1 / zoomLevel.value)
  const height = 600 * (1 / zoomLevel.value)
  const x = panX.value - width / 2
  const y = panY.value - height / 2
  return `${x} ${y} ${width} ${height}`
})

// Position calculation using hierarchical layout
const personPositions = computed(() => {
  if (props.people.length === 0) return new Map<string, Position>()
  
  const positions = new Map<string, Position>()
  const generations = calculateGenerations(props.people, props.relationships)
  const layout = calculateLayout(generations)
  
  layout.forEach((position, personId) => {
    positions.set(personId, position)
  })
  
  return positions
})

// Helper function to get person position
const getPersonPosition = (personId: string): Position => {
  return personPositions.value.get(personId) || { x: 0, y: 0 }
}

// Generation calculation algorithm (DFS-based)
function calculateGenerations(people: Person[], relationships: Relationship[]): Map<number, Person[]> {
  const generations = new Map<number, Person[]>()
  const personGeneration = new Map<string, number>()
  const visited = new Set<string>()
  
  // Build parent-child relationship map
  const children = new Map<string, string[]>()
  const parents = new Map<string, string[]>()
  
  relationships.forEach(rel => {
    if (!children.has(rel.parentId)) children.set(rel.parentId, [])
    if (!parents.has(rel.childId)) parents.set(rel.childId, [])
    
    children.get(rel.parentId)!.push(rel.childId)
    parents.get(rel.childId)!.push(rel.parentId)
  })
  
  // Find root generation (people with no parents)
  const roots = people.filter(person => !parents.has(person.id))
  
  // DFS to calculate generations
  function assignGeneration(personId: string, generation: number) {
    if (visited.has(personId)) return
    visited.add(personId)
    
    personGeneration.set(personId, generation)
    
    // Add to generation group
    if (!generations.has(generation)) generations.set(generation, [])
    const person = people.find(p => p.id === personId)
    if (person) generations.get(generation)!.push(person)
    
    // Process children
    const childrenIds = children.get(personId) || []
    childrenIds.forEach(childId => {
      assignGeneration(childId, generation + 1)
    })
  }
  
  // Start from roots (generation 0)
  roots.forEach(person => assignGeneration(person.id, 0))
  
  // Handle orphaned people (no relationships)
  people.forEach(person => {
    if (!visited.has(person.id)) {
      assignGeneration(person.id, 0)
    }
  })
  
  return generations
}

// Layout calculation algorithm
function calculateLayout(generations: Map<number, Person[]>): Map<string, Position> {
  const layout = new Map<string, Position>()
  const nodeWidth = 120
  const nodeHeight = 80
  const horizontalGap = 160
  const verticalGap = 120
  
  let currentY = 50 // Starting Y position
  
  generations.forEach((people) => {
    const totalWidth = people.length * nodeWidth + (people.length - 1) * horizontalGap
    let currentX = -(totalWidth / 2) + (nodeWidth / 2) // Center horizontally
    
    people.forEach(person => {
      layout.set(person.id, {
        x: currentX,
        y: currentY
      })
      currentX += nodeWidth + horizontalGap
    })
    
    currentY += nodeHeight + verticalGap
  })
  
  return layout
}

// Event handlers
const onPersonClick = (person: Person) => {
  selectedPersonId.value = person.id
  emit('personClick', person)
}

const onCanvasClick = (event: MouseEvent) => {
  selectedPersonId.value = undefined
  emit('canvasClick', event)
}

// Zoom controls
const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.2)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.2)
  }
}

const resetView = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  selectedPersonId.value = undefined
}
</script>

<style scoped>
.family-tree-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.family-tree-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.family-tree-svg:active {
  cursor: grabbing;
}

.relationships-layer {
  pointer-events: none;
}

.persons-layer {
  pointer-events: all;
}

.tree-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  background-color: var(--color-background);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .tree-controls {
    top: 8px;
    right: 8px;
    padding: 6px;
  }
}
</style>