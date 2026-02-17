DROP EVENT IF EXISTS `e_cleanup_sessions`;

-- START Event Script
DELIMITER $$
CREATE EVENT `e_cleanup_sessions`
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURDATE(), '00:00:00')
DO
main:BEGIN

  DELETE FROM 
    rate_limit 
  WHERE 
    lastRequest < (UNIX_TIMESTAMP(NOW()) - 60) * 1000;

  DELETE FROM 
    session 
  WHERE 
    expiresAt < NOW();

END $$
DELIMITER ;

-- This event is already DEPRECATED. Sessions and rate limits are now stored at upstash/redis.
