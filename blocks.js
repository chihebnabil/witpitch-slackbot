exports.SKILLS_EXTRACT_BLOCK = [
    {
        "type": "section",
        "block_id": "section678",
        "text": {
            "type": "mrkdwn",
            "text": "Pick a staffing request from the dropdown list"
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

exports.REQUEST_PITCH_BLOCK = [
    {
        "type": "input",
        "element": {
            "type": "plain_text_input",
            "action_id": "staffing_request_id"
        },
        "label": {
            "type": "plain_text",
            "text": "Staffing Request ID",
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "plain_text_input",
            "action_id": "developer_id"
        },
        "label": {
            "type": "plain_text",
            "text": "Developer ID",
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "plain_text_input",
            "multiline": true,
            "action_id": "pitch_input"
        },
        "label": {
            "type": "plain_text",
            "text": "What is not mentioned in the profile that highlights why this candidate is a great fit for the role?",
            "emoji": true
        }
    },
    {
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Pitch",
                    "emoji": true
                },
                "value": "click_me_123",
                "action_id": "pitch_button_click"
            }
        ]
    }
]
