<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)

let scene, camera, renderer
let particles, lines
let particlePositions, particleVelocities
let animationId

const PARTICLE_COUNT = 200
const CONNECTION_DISTANCE = 120
const ROTATION_SPEED = 0.0004

function init() {
  const container = canvasRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 300

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  particleVelocities = []

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 600
    positions[i * 3 + 1] = (Math.random() - 0.5) * 400
    positions[i * 3 + 2] = (Math.random() - 0.5) * 300
    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.3,
      y: (Math.random() - 0.5) * 0.3,
      z: (Math.random() - 0.5) * 0.15,
    })
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particlePositions = geometry.attributes.position.array

  const material = new THREE.PointsMaterial({
    color: 0xf59e0b,
    size: 2.5,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  const lineGeo = new THREE.BufferGeometry()
  const linePositions = new Float32Array(PARTICLE_COUNT * (PARTICLE_COUNT - 1) * 3)
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  lineGeo.setDrawRange(0, 0)

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  lines = new THREE.LineSegments(lineGeo, lineMat)
  scene.add(lines)

  animate()
}

function updateConnections() {
  const positions = particles.geometry.attributes.position.array
  const linePositions = lines.geometry.attributes.position.array
  let count = 0

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = i * 3
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      const jx = j * 3
      const dx = positions[ix] - positions[jx]
      const dy = positions[ix + 1] - positions[jx + 1]
      const dz = positions[ix + 2] - positions[jx + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < CONNECTION_DISTANCE) {
        linePositions[count * 3] = positions[ix]
        linePositions[count * 3 + 1] = positions[ix + 1]
        linePositions[count * 3 + 2] = positions[ix + 2]
        linePositions[count * 3 + 3] = positions[jx]
        linePositions[count * 3 + 4] = positions[jx + 1]
        linePositions[count * 3 + 5] = positions[jx + 2]
        count += 2
      }
    }
  }

  lines.geometry.attributes.position.needsUpdate = true
  lines.geometry.setDrawRange(0, count)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  particles.rotation.x += ROTATION_SPEED * 0.5
  particles.rotation.y += ROTATION_SPEED

  const positions = particles.geometry.attributes.position.array

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] += particleVelocities[i].x
    positions[i * 3 + 1] += particleVelocities[i].y
    positions[i * 3 + 2] += particleVelocities[i].z

    if (Math.abs(positions[i * 3]) > 300) particleVelocities[i].x *= -1
    if (Math.abs(positions[i * 3 + 1]) > 200) particleVelocities[i].y *= -1
    if (Math.abs(positions[i * 3 + 2]) > 150) particleVelocities[i].z *= -1
  }

  particles.geometry.attributes.position.needsUpdate = true
  updateConnections()

  renderer.render(scene, camera)
}

function onResize() {
  if (!renderer) return
  const container = canvasRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  init()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
  if (particles) {
    particles.geometry.dispose()
    particles.material.dispose()
  }
  if (lines) {
    lines.geometry.dispose()
    lines.material.dispose()
  }
})
</script>

<template>
  <div ref="canvasRef" class="absolute inset-0 z-0"></div>
</template>
