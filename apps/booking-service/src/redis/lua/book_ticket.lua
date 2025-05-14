local stock = redis.call('GET', KEYS[1])
if not stock or tonumber(stock) < 1 then
  return -2
end

if redis.call('EXISTS', KEYS[2]) == 1 then
  return -1
end

redis.call('DECR', KEYS[1])
redis.call('SET', KEYS[2], 1)
return 1