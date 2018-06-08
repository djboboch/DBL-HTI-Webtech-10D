import json
import shutil
import sys
import os

from ete3 import Tree, TreeNode, os
from random import randint


#Path Names
file_name = os.listdir('uploads/')[0]
pathToTree = "uploads/" + file_name
tree_name = os.path.splitext(os.path.basename("uploads/" + file_name))[0]

def processing():
    tree = Tree(pathToTree, format=1) #Creates the ete3 tree object
    jsongraph = newicktojson(tree, tree) #invokes newicktojson using the tree object
    with open(tree_name + '.json', 'a') as the_file: #opens the json file
        the_file.write(jsongraph) #saves the content of jsongraph into the json file
    shutil.move(tree_name + '.json', "convertedTrees/" + tree_name + ".json" ) #moves the tree into correct folder
    return

def newicktojson(tree, nodeG):
    treestring = ""
    treestring += "{ \n\"name\": \"" + nodeG.name + "\""
    if nodeG.children:
        treestring += ",\n\"children\": ["
        list = []
        for child in nodeG.children:
            list.append(newicktojson(tree, child))
        treestring += ', '.join(list)
        treestring += "]\n"
    else:
        treestring += ", \"size\": "
        if hasattr(nodeG, 'size'):
            treestring += nodeG.size
        else:
            treestring += str(randint(1000, 10000))
    treestring += "}"
    return treestring

if __name__ == "__main__":
    processing()