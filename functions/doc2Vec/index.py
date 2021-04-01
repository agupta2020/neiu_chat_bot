import numpy as np
import gensim
import boto3
import csv
import json


def my_handler(event, context):
    # loading the model
    key = 'student.txt'
    modelName = 'unibot.model'
    bucket = 'neiu-chat-bot'
    model = gensim.models.doc2vec.Doc2Vec.load(
        "s3://"+bucket+"/"+modelName)
    # capturing user's utterance
    inputTranscript = event['inputTranscript']
    inputList = gensim.utils.simple_preprocess(inputTranscript)
    new_vector = model.infer_vector(inputList)
    sims = model.docvecs.most_similar([new_vector])
    first_tuple_elements = [int(a_tuple[0]) for a_tuple in sims]
    s3_resource = boto3.resource('s3')
    s3_object = s3_resource.Object(bucket, key)
    data = s3_object.get()['Body'].read().decode('utf-8').splitlines()
    npArray = np.array(data)
    result = npArray[first_tuple_elements].tolist()
    print(result)
    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }
