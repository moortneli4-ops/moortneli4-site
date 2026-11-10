--!mgscr-begin
--title,Rocket
--variable,beat,headLen,整流罩长度,0,1,16
--variable,track,headWidth,整流罩宽度,2,16,6
--variable,beat,shaftLen,箭体长度,0,1,8
--variable,track,shaftWidth,箭体宽度,1,16,4
--variable,beat,sackLen,尾翼长度,0,1,16
--variable,track,sackWidth,尾翼宽度（单侧）,1,8,3
--!mgscr-end

function main()
  local totalLen = sackLen + shaftLen + headLen
  local shaftX = math.floor((16 - shaftWidth) / 2)
  local step = 5
  local tipWidth = 2
  local inserted = {}

  local function addNode(tick, x, w)
    tick = math.floor(tick / step + 0.5) * step
    tick = math.max(0, tick)
    x = math.max(0, math.min(x, 15))
    w = math.max(1, math.min(w, 16 - x))
    if not inserted[tick] then
      inserted[tick] = true
      table.insert(g_Elements, { x = x, width = w, tick = tick })
    end
  end

  -- ===== 尾翼区域（tick: 0 ~ sackLen） =====
  -- 箭体居中贯穿。两侧各以 sin 曲线对称膨出，膨出后再对称收缩。
  -- 遍历每个 x 整数值，根据正弦曲线反算出对应的上下两个对称 tick。
  if sackLen > 0 and sackWidth > 0 then
    local xMin = math.max(0, math.floor(shaftX - sackWidth))
    for x = math.floor(shaftX), xMin, -1 do
      local cv = (shaftX - x) / sackWidth
      cv = math.max(0, math.min(1, cv))
      local w = shaftWidth + 2 * (shaftX - x)
      local tUp = (sackLen / math.pi) * math.asin(cv)
      local tDown = sackLen - tUp
      if tDown - tUp < 1 then
        addNode(sackLen / 2, x, w)
      else
        addNode(tUp, x, w)
        addNode(tDown, x, w)
      end
    end
  end

  -- ===== 箭体区域（tick: sackLen ~ shaftEnd） =====
  -- 纯直杆，宽度和 x 全程不变。
  local shaftEnd = sackLen + shaftLen
  addNode(sackLen, shaftX, shaftWidth)
  addNode(shaftEnd, shaftX, shaftWidth)

  -- ===== 头部区域 =====
  -- 使用“半径”方案确保左右严格对称：
  --   半径 r = 每侧突出量 = (w - shaftWidth) / 2
  --   r > 0 时两侧均膨出 r；r < 0 时两侧均内缩 |r|。
  --   x = shaftX - r
  --   w = shaftWidth + 2 * r
  -- 曲线用 cos(π/2 * progress) 实现基部缓慢、端部加速的钟形收窄。

  local headRadius = (headWidth - shaftWidth) / 2
  local tipRadius = (tipWidth - shaftWidth) / 2

  -- 最大宽度节点（箭体末端 + 5 tick）
  local headMaxTick = math.min(shaftEnd + step, totalLen)
  local rMax = math.floor(headRadius + 0.5)
  addNode(headMaxTick, shaftX - rMax, shaftWidth + 2 * rMax)

  -- 收窄曲线（headMaxTick ~ totalLen）
  -- 与尾翼区域一致：按半径 r 的每个整数值变化反算 tick，而非按固定 tick 间隔采样。
  if headMaxTick < totalLen and headRadius > tipRadius then
    local headRange = totalLen - headMaxTick
    local rMin = math.floor(tipRadius + 0.5)
    for r = rMax - 1, rMin, -1 do
      local cv = (r - tipRadius) / (headRadius - tipRadius)
      cv = math.max(0, math.min(1, cv))
      local progress = (2 / math.pi) * math.acos(cv)
      local t = headMaxTick + headRange * progress
      addNode(t, shaftX - r, shaftWidth + 2 * r)
    end
  end

  -- 最终 clamp 和排序
  for i = 1, #g_Elements do
    g_Elements[i].width = math.max(1, math.min(g_Elements[i].width, 16 - g_Elements[i].x))
  end
  table.sort(g_Elements, function(a, b) return a.tick < b.tick end)
end
