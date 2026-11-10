--!mgscr-begin
--title,Curve (bezier)
--variable,beat,yEnd,长度,0,1,4
--variable,track,sWidth,宽度,1,16,4
--variable,track,xStart,起点,0,15,0
--variable,track,xEnd,终点,0,15,8
--variable,track,xControl,控制点横坐标,-16,32,12
--variable,beat,yControl,控制点纵坐标,0,1,8
--variable,check,symmetryH,左右对称,0
--variable,check,symmetryV,上下对称,0
--variable,check,flipH,左右反转,0
--variable,check,flipV,上下反转,0
--!mgscr-end

-- 贝塞尔曲线SLIDE脚本 by Lobolus
-- 生成一条由 (xStart,0), (xControl,yControl), (xEnd,yEnd) 决定的二次贝塞尔曲线SLIDE
-- 和 Claude Code 斗智斗勇的产物

function main()
  local tickLength = yEnd

  -- 二次贝塞尔 x(t) = (1-t)²·xStart + 2(1-t)t·xControl + t²·xEnd
  -- 整理为 a·t² + b·t + c = 0 的形式，其中 c = xStart - xTarget
  local a = xStart - 2 * xControl + xEnd
  local b = 2 * (xControl - xStart)

  -- x 的取值范围（二次贝塞尔曲线始终在控制点的凸包内）
  local xMin = math.max(math.min(xStart, xControl, xEnd), 0)
  local xMax = math.min(math.max(xStart, xControl, xEnd), 15)

  -- 记录上一个插入的点，用于跳过完全重复的 (x, tick)
  local lastX = nil
  local lastTick = nil

  for xTarget = xMin, xMax do
    local c = xStart - xTarget

    if a == 0 then
      -- 线性情况：xControl 在 xStart 和 xEnd 的连线上
      if b ~= 0 then
        local t = -c / b
        if t >= -0.0001 and t <= 1.0001 then
          t = math.max(0, math.min(1, t))
          local y = 2 * (1 - t) * t * yControl + t * t * yEnd
          local tick = math.floor(y / 5 + 0.5) * 5
          if tick >= 0 and tick <= tickLength then
            local w = math.min(sWidth, 16 - xTarget)
            if not (xTarget == lastX and tick == lastTick) then
              table.insert(g_Elements, {
                x = xTarget,
                width = w,
                tick = tick
              })
              lastX = xTarget
              lastTick = tick
            end
          end
        end
      else
        -- x 恒定（xStart == xControl == xEnd），按 t 采样
        local steps = math.max(math.floor(tickLength / 24), 2)
        if xTarget == xStart then
          for i = 0, steps do
            local t = i / steps
            local y = 2 * (1 - t) * t * yControl + t * t * yEnd
            local tick = math.floor(y / 5 + 0.5) * 5
            if tick >= 0 and tick <= tickLength then
              local w = math.min(sWidth, 16 - xTarget)
              if not (xTarget == lastX and tick == lastTick) then
                table.insert(g_Elements, {
                  x = xTarget,
                  width = w,
                  tick = tick
                })
                lastX = xTarget
                lastTick = tick
              end
            end
          end
        end
      end
    else
      local disc = b * b - 4 * a * c
      if disc >= 0 then
        local sqrtDisc = math.sqrt(disc)
        local roots = {}
        -- 两个根
        roots[1] = (-b + sqrtDisc) / (2 * a)
        roots[2] = (-b - sqrtDisc) / (2 * a)

        for _, tVal in ipairs(roots) do
          if tVal >= -0.0001 and tVal <= 1.0001 then
            tVal = math.max(0, math.min(1, tVal))
            local y = 2 * (1 - tVal) * tVal * yControl + tVal * tVal * yEnd
            local tick = math.floor(y / 5 + 0.5) * 5
            if tick >= 0 and tick <= tickLength then
              local w = math.min(sWidth, 16 - xTarget)
              if not (xTarget == lastX and tick == lastTick) then
                table.insert(g_Elements, {
                  x = xTarget,
                  width = w,
                  tick = tick
                })
                lastX = xTarget
                lastTick = tick
              end
            end
          end
        end
      end
    end
  end

  -- 按 tick 排序
  table.sort(g_Elements, function(a, b)
    return (a.tick < b.tick)
  end)

  if flipH == 1 then -- 左右反转
    for i = 1, #g_Elements do
      g_Elements[i].x = 16 - g_Elements[i].x - g_Elements[i].width
    end
  end

  if flipV == 1 then -- 上下反转
    for i = 1, #g_Elements do
      g_Elements[i].tick = tickLength - g_Elements[i].tick
    end
    table.sort(g_Elements, function(a, b)
      return (a.tick < b.tick)
    end)
  end

  if symmetryV == 1 then -- 上下对称：保留下半部分 + 生成对称点
    local half = tickLength / 2
    local newElements = {}
    
    -- 1. 只保留下半部分的点（tick <= half）
    for _, elem in ipairs(g_Elements) do
        if elem.tick <= half + 1e-6 then  -- 容差处理浮点误差
            table.insert(newElements, elem)
        end
    end
    
    -- 2. 为每个下半部分的点生成对称点（排除中点自身重复）
    local lowerCount = #newElements
    for i = 1, lowerCount do
        local elem = newElements[i]
        local symTick = tickLength - elem.tick
        if symTick > elem.tick + 1e-6 then  -- 只添加严格大于原tick的对称点，避免中点重复
            table.insert(newElements, {
                x = elem.x,
                width = elem.width,
                tick = symTick
            })
        end
    end
    
    -- 3. 按 tick 升序排序
    table.sort(newElements, function(a, b) return a.tick < b.tick end)
    
    -- 4. 替换原数组，tickLength 不变
    g_Elements = newElements
end

  if symmetryH == 1 then -- 左右对称
    for i = 1, #g_Elements do
      if (g_Elements[i].x >= 7) then
        g_Elements[i].x = 16 - g_Elements[i].x - math.max(g_Elements[i].width, 2)
      end
      g_Elements[i].width = math.max(16 - g_Elements[i].x * 2,
        math.min(g_Elements[i].x + g_Elements[i].width, 8) - g_Elements[i].x)
    end
  end
end
