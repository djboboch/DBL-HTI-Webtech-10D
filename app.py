import json
import shutil


from flask import Flask, render_template, request, redirect
from ete3 import Tree, TreeNode, os
from random import randint
from nocache import nocache

app = Flask(__name__)
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
aclist = []
nrg = 1
sv1 = None  # show visualisation 1
sv2 = None  # show visualisation 2
filename = ""

@app.route("/")
@nocache
def index():
    return render_template("project.html")


@app.route("/upload", methods=['POST'])
@nocache
def upload():
    target = os.path.join(APP_ROOT, "trees/")
    print(target)
    if not os.path.isdir(target):
        os.mkdir(target)

    for file in request.files.getlist("file"):
        print(file)
        global filename
        filename = file.filename
        destination = "/".join([target, filename])
        print("for")
        print(destination)
        file.save(destination)
        global tree
        tree = Tree("trees/" + filename, format=1)

    return redirect('/processing')


@app.route("/processing")
@nocache
def processing():
    jsongraph = newicktojson(tree, tree)
    os.remove("trees/" + filename)
    with open('treeconverted.json', 'a') as the_file:
        the_file.write(jsongraph)

    shutil.move("treeconverted.json", "static/treeconverted.json")
    return redirect('/visualisation1')


# visual 1
@app.route('/visualisation1')
@nocache
def graphvisualize1():
    return render_template("visual.html", sv1=1, sv2=0)


@app.route('/visualisation2')
@nocache
def graphvisualize2():
    return render_template("visual.html", sv1=0, sv2=1)


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
    app.run(port=5000, debug=True)
