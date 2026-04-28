ALTER TABLE `appointments`
MODIFY `status` ENUM('pending', 'accepted', 'cancelled', 'done')
NOT NULL DEFAULT 'pending';
