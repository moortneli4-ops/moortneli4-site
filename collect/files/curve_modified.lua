--!mgscr-begin
--title,Curve (customBend)
--variable,beat,length,Length (Measures),0,1,8
--variable,track,width,SLIDE Width,1,16,4
--variable,track,xMove,SLIDE Movement,0,15,12
--variable,track,xOffset,Horizontal Movement,0,16,0
--variable,track,eps,curveBend,0,25,10
--variable,check,symmetryH,Horizontal Symmetry,0
--variable,check,symmetryV,Vertical Symmetry,0
--variable,check,flipH,Flip Horizontally,0
--variable,check,flipV,Flip Vertically,0
--variable,check,inverse,Inverse Curve,0
--!mgscr-end


--Modified from original script by Foahh
--Added customized curve bend control by Lobolus

function Solver(t, epsilon)
  return epsilon * t + (1 - epsilon) * (1 - math.sqrt(1 - t * t))
end

function InverseSolver(y, epsilon)
  epsilon = epsilon or 0
  local bias, offset = epsilon / (1 - epsilon), ((1 - epsilon) - y) / (1 - epsilon)

  local qA, qB, qC = 1 + bias * bias, 2 * offset * bias, offset * offset - 1
  local discriminant = math.max(0, qB * qB - 4 * qA * qC)
  return (-qB + math.sqrt(discriminant)) / (2 * qA)
end

function Interpolate(t, inverse)
  if inverse == 1 then
    return InverseSolver(t, 0.5-0.02*eps)
  else
    return Solver(t, 0.02*eps)
  end
end

local tickLength = 240

-- Obtain the element of SLIDE from the amount of movement.
function getSlideBaseElms(x, inverse) -- x is the amount of movement
  local elm = {}

  -- case when x = 0
  if x == 0 then
    table.insert(elm, { tick = 0, x = 0 })
    table.insert(elm, { tick = tickLength, x = 0 })
    return elm
  end

  for i = 0, x do
    local q = i / x
    local tick = tickLength * Interpolate(q, inverse)

    -- fine-tuning
    if inverse == 0 and i == x then
      table.insert(elm, { tick = tickLength * 0.875, x = x })
    end

    table.insert(elm, { tick = math.floor(tick), x = i })
  end

  return elm
end

-- Original code from curve.lua by @inonote
function main()
  local baseElm = getSlideBaseElms(xMove, inverse)

  for i = 1, #baseElm do
    local w = width
    local x = baseElm[i].x + xOffset
    w = math.min(w, 16 - x)
    table.insert(g_Elements, {
      x = x,
      width = w,
      tick = baseElm[i].tick
    })
  end

  if flipH == 1 then -- flip horizontally
    for i = 1, #g_Elements do
      g_Elements[i].x = 16 - g_Elements[i].x - g_Elements[i].width
    end
  end

  if flipV == 1 then -- flip vertically
    for i = 1, #g_Elements do
      g_Elements[i].tick = tickLength - g_Elements[i].tick
    end
    table.sort(g_Elements, function(a, b)
      return (a.tick < b.tick)
    end)
  end

  if symmetryV == 1 then -- symmetry vertical
    for i = #g_Elements - 1, 1, -1 do
      table.insert(g_Elements, {
        x = g_Elements[i].x,
        width = g_Elements[i].width,
        tick = tickLength * 2 - g_Elements[i].tick
      })
    end
    tickLength = 480
  end

  if symmetryH == 1 then -- symmetry horizontal
    for i = 1, #g_Elements do
      if (g_Elements[i].x >= 7) then
        g_Elements[i].x = 16 - g_Elements[i].x - math.max(g_Elements[i].width, 2)
      end
      g_Elements[i].width = math.max(16 - g_Elements[i].x * 2,
        math.min(g_Elements[i].x + g_Elements[i].width, 8) - g_Elements[i].x)
    end
  end

  -- scale tick
  local scaleTick = length / tickLength
  for i = 1, #g_Elements do
    g_Elements[i].tick = g_Elements[i].tick * scaleTick
  end
end
