
CREATE OR REPLACE FUNCTION enqueue_messages(jid int) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE 
    selected_campaign_id int;
BEGIN
	-- only one worker will be able to set this job's status
	UPDATE job_queue SET status = 'SENDING' WHERE id = jid AND status = 'ENQUEUED'
	RETURNING campaign_id INTO selected_campaign_id;

	WITH messages AS 
	(UPDATE email_messages m SET dequeued_at = clock_timestamp() 
	WHERE m.campaign_id = selected_campaign_id
	-- check for message_id is null because we dont want to enqueue messages that have already been sent
	AND m.message_id is NULL
	RETURNING * )

	INSERT INTO email_ops 
	(campaign_id, 
	recipient, 
	params, 
	message_id,
	error_code,
	dequeued_at, 
	sent_at, 
	delivered_at,
	received_at,
	created_at,
	updated_at)  
	(SELECT  
	campaign_id, 
	recipient, 
	params, 
	message_id,
	error_code,
	dequeued_at,
	-- sent_at is set to null so that the sending step will pick up this message
	NULL,
	delivered_at,
	received_at,
	created_at,
	updated_at FROM messages);
END $$;