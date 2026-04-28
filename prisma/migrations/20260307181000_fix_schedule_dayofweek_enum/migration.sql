ALTER TABLE `schedules`
MODIFY `day_of_week` ENUM(
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
) NOT NULL;
