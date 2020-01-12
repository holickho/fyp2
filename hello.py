import sys 
import pickle
# Takes first name and last name via command  
# line arguments and then display them 
print("Output from Python") 
print("First name: " + sys.argv[1]) 
# print("Last name: " + sys.argv[2]) 
pickle_in = open("pretrainedVec_model.pkl","rb")
sa = pickle.load(pickle_in)
