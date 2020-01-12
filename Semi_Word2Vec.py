import argparse
import pandas as pd
from io import StringIO
from tweet_preprocessor import preprocessor as p
from nltk.tokenize import RegexpTokenizer
import re
import joblib
from tqdm import tqdm
import gensim
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from sklearn.preprocessing import scale
LabeledSentence = gensim.models.doc2vec.LabeledSentence
import sys 

n_dim = 300

def load_sentence():
    #load sentence
    sentence = sentence
    data = pd.DataFrame([x.split(';') for x in sentence.split('\n')])
    data.columns=['text']
    
    return data

def load_csvfile():
    #load data
    data = pd.read_csv(filepath)
    data.columns = ['index','text']
    data.drop(['index'], axis=1, inplace=True)
    data.drop_duplicates(subset ="text", keep = False, inplace = True)
    
    return data

def file_preprocessing(data):
    #preprocessing csv file

    pattern = re.compile(r"(.)\1{2,}", re.DOTALL)
    tokenizer = RegexpTokenizer(r'\w+')

    cleanedData = data
    cleanedData['text'] = cleanedData['text'].apply(lambda x: x.lower())
    cleanedData['text'] = cleanedData['text'].apply(lambda x: ' '.join(re.sub("(can't|cannot)","can not",x).split()))
    cleanedData['text'] = cleanedData['text'].apply(lambda x: ' '.join(re.sub("(n't)"," not",x).split()))
    cleanedData['text'] = cleanedData['text'].apply(lambda x: ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)"," ",x).split()))
    cleanedData['text'] = cleanedData['text'].apply(lambda x: ' '.join(re.sub(pattern, r"\1",x).split()))
    cleanedData['text'] = cleanedData['text'].apply(lambda x: p.clean(x))
    cleanedData['text'] = cleanedData['text'].apply(lambda x: tokenizer.tokenize(x))
    
    return cleanedData

def labelizeData(text, label_type):
    labelized = []
    for i,v in tqdm(enumerate(text)):
        label = '%s_%s'%(label_type,i)
        labelized.append(LabeledSentence(v, [label]))
    return labelized

def buildWordVector(tokens, size, w2v, tfidf):
    vec = np.zeros(size).reshape((1, size))
    count = 0.
    for word in tokens:
        try:
            vec += w2v[word].reshape((1, size)) * tfidf[word]
            count += 1.
        except KeyError: # handling the case where the token is not
                         # in the corpus. useful for testing.
            continue
    if count != 0:
        vec /= count
    return vec

def create_feature(data):
    #load word2vec model
    w2v = gensim.models.KeyedVectors.load_word2vec_format('vectors/GoogleNews-vectors-negative300.bin', binary=True)
    
    #Get tokens
    data = labelizeData(data, 'DATA')
    
    #Get tf-idf feature
    print ('building tf-idf matrix ...')
    vectorizer = TfidfVectorizer(analyzer=lambda x: x, min_df=10)
    matrix = vectorizer.fit_transform([x.words for x in data])
    tfidf = dict(zip(vectorizer.get_feature_names(), vectorizer.idf_))
    print ('vocab size :', len(tfidf))
    
    #combine tf-idf and word2vec
    print ('building word vectors...')
    tfidf_w2v_vecs = np.concatenate([buildWordVector(z, n_dim, w2v, tfidf) for z in tqdm(map(lambda x: x.words, data))])
    tfidf_w2v_vecs = scale(tfidf_w2v_vecs)
    
    return tfidf_w2v_vecs

def predict(data):
    #load model
    model = joblib.load('model/pretrainedVec_model.pkl')
    
    #create feature
    processed_data = create_feature(data)
    
    #predict
    label = model.predict(processed_data)
    intensity = model.predict_proba(processed_data)
    
    return label,intensity

def output_csv(data, label, intensity):
    emotionFrame = pd.DataFrame({'emotion': label})
    intensityFrame = pd.DataFrame({'anger': intensity[:, 0], 
                                   'fear': intensity[:, 1], 
                                   'happiness': intensity[:, 2], 
                                   'neutral': intensity[:, 3], 
                                   'sadness': intensity[:, 4], 
                                   'disgust': intensity[:, 5], 
                                   'surprise': intensity[:, 6]})
    
    emotionFrame = emotionFrame.replace({'emotion' : { 0 : 'anger', 
                                       1 : 'fear', 
                                       2 : 'happiness', 
                                       3 : 'neutral', 
                                       4 : 'sadness', 
                                       5 : 'disgust', 
                                       6 : 'surprise'}})
    
    intensityFrame['intensity'] = intensityFrame.max(axis=1)
    intensityFrame = intensityFrame[['intensity']]
    
    output = pd.concat([data, emotionFrame, intensityFrame], axis=1, sort=False)
    output.to_csv('result/w2vEmotion_result.csv', index=False, header=False)
    
    return

if __name__ == '__main__':
    # parser = argparse.ArgumentParser(description='Parameter')
    # parser.add_argument("--method", type=int, default="", help="Text=1 or Document=2 (eg, 1)")
    # parser.add_argument("--file", type=str, default="", help="File path (eg, input_file/labels7_data.csv)")
    # parser.add_argument("--text", type=str, default="", help="Text (eg, 'what a bad day')")
    # params = parser.parse_args()

    method = sys.argv[1]
    sentence = sys.argv[2]
    filepath = sys.argv[3]

    if(method == 1):
        data = load_sentence()
        clean_data = file_preprocessing(data)
        result = predict(clean_data)
        output_csv(data, result[0], result[1])

    elif(method == 2):
        data = load_csvfile()
        clean_data = file_preprocessing(data)
        result = predict(clean_data)
        output_csv(data, result[0], result[1])