SELECT count(*)
FROM vehicles
WHERE ownerId = $1;