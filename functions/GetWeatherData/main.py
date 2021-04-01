import os
import time
import requests
import logging


logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
# --- Main handler -----


def lambda_handler(event, context):
    os.environ['TZ'] = 'America/New_York'
    time.tzset()
    logger.debug('event.bot.name={}'.format(event['bot']['name']))
    return dispatch(event)


def dispatch(intent_request):
    intent_name = intent_request['currentIntent']['name']
    if intent_name == 'getTodaysTemp':
        return get_weather(intent_request)


# --- Helpers that build all of the responses ---

def get_weather(intent_request):
    slots = intent_request['currentIntent']['slots']
    value = intent_request['currentIntent']['slots']['Location']
    session_attributes = {}
    r = requests.get('http://api.openweathermap.org/data/2.5/weather?q=' +
                     value+'&appid=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    json_object = r.json()
    temp_k = float(json_object['main']['temp'])
    temp = temp_k - 273.15
    temp_c = str(temp)
    return close(
        session_attributes,
        'Fulfilled', {
            'contentType': 'PlainText',
            'content': 'The temperature in '+value+' is '+temp_c+' degree Celsius'}
    )


def close(session_attributes, fulfillment_state, message):
    response = {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }
    return response
