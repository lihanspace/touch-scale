export const getDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

type TouchScaleOptions = {
  /** 缩放元素的父元素 或 选择器 */
  scaleContainer: HTMLElement | string
  /** 缩放元素 或 选择器 */
  scaleElement: HTMLElement | string
  /** 最小缩放比例 默认0.3 */
  minScale?: number
  /** 最大缩放比例 默认2 */
  maxScale?: number
  /** 捕获touch事件 */
  capture?: boolean
  /** 是否同步调整缩放元素的宽 */
  syncWidth?: boolean
  /** 是否同步调整缩放元素的高 */
  syncHeight?: boolean
}
export default class TouchScale {
  public scaleContainer: HTMLElement
  public scaleElement: HTMLElement
  public capture?: boolean
  public minScale = 0.3
  public maxScale = 2
  public initialWidth = 0
  public initialHeight = 0
  public startDistance = 0
  public startScale = 1
  constructor(options: TouchScaleOptions) {
    if (typeof options.scaleContainer === 'string') {
      const el = document.querySelector<HTMLElement>(options.scaleContainer)
      if (!el) throw new Error('[TouchScale] scaleContainer is not found')
      this.scaleContainer = el
    } else {
      this.scaleContainer = options.scaleContainer
    }
    if (typeof options.scaleElement === 'string') {
      const el = document.querySelector<HTMLElement>(options.scaleElement)
      if (!el) throw new Error('[TouchScale] scaleElement is not found')
      this.scaleElement = el
    } else {
      this.scaleElement = options.scaleElement
    }
    if (options.syncWidth) this.initialWidth = this.scaleElement.offsetWidth
    if (options.syncHeight) this.initialHeight = this.scaleElement.offsetHeight
    if (options.minScale) this.minScale = options.minScale
    if (options.maxScale) this.maxScale = options.maxScale
    this.capture = options.capture
    if (getComputedStyle(this.scaleContainer).touchAction !== 'none') this.scaleContainer.style.touchAction = 'none'
    const scaleElStyle = getComputedStyle(this.scaleElement)
    if (scaleElStyle.touchAction !== 'none') this.scaleElement.style.touchAction = 'none'
    if (scaleElStyle.transformOrigin !== 'top left') this.scaleElement.style.transformOrigin = 'top left'
    console.log('this.scaleElement.style.transformOrigin', this.scaleElement.style.transformOrigin)
    this.scaleContainer.addEventListener('touchstart', this.handleTouchStart, { capture: this.capture })
  }

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length === 2 && this.scaleElement) {
      this.startDistance = getDistance(event.touches[0], event.touches[1])
      this.startScale = parseFloat(this.scaleElement.style.transform.match(/scale\((.+)\)/)?.[1] ?? '1')
      // 将 touchmove 和 touchend 事件绑定到 document 上
      document.addEventListener('touchmove', this.handleTouchMove, { capture: this.capture })
      document.addEventListener('touchend', this.handleTouchEnd, { capture: this.capture })
    }
  }

  private handleTouchMove = (event: TouchEvent): void => {
    if (event.touches.length === 2 && this.scaleElement) {
      const currentDistance = getDistance(event.touches[0], event.touches[1])
      let newScale = this.startScale + (currentDistance - this.startDistance) / 100 / 10

      // 限制缩放比例
      if (newScale > this.maxScale) {
        newScale = this.maxScale
      } else if (newScale < this.minScale) {
        newScale = this.minScale
      }

      // 计算新的宽高
      const newWidth = this.initialWidth / newScale
      const newHeight = this.initialHeight / newScale

      // 设置元素的宽高和缩放
      this.scaleElement.style.width = `${newWidth}px`
      this.scaleElement.style.height = `${newHeight}px`
      this.scaleElement.style.transform = `scale(${newScale})`
    }
  }

  private handleTouchEnd = (event: TouchEvent): void => {
    if (event.touches.length < 2 && this.scaleElement) {
      // 移除绑定在 document 上的事件监听器
      document.removeEventListener('touchmove', this.handleTouchMove, { capture: this.capture })
      document.removeEventListener('touchend', this.handleTouchEnd, { capture: this.capture })
    }
  }
  destroy() {
    this.scaleContainer.removeEventListener('touchstart', this.handleTouchStart, { capture: this.capture })
    document.removeEventListener('touchmove', this.handleTouchMove, { capture: this.capture })
    document.removeEventListener('touchend', this.handleTouchEnd, { capture: this.capture })
  }
}
