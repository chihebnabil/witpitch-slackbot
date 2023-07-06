exports.PITCH_BLOCK = [
    {
        "type": "section",
        "block_id": "section678",
        "text": {
            "type": "mrkdwn",
            "text": "Pick an item from the dropdown list"
        },
        "accessory": {
            "action_id": "autocomplete_field",
            "type": "external_select",
            "placeholder": {
                "type": "plain_text",
                "text": "Select an item"
            },
            "min_query_length": 3
        }
    }
]