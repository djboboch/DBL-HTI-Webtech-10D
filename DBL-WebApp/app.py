import json
from flask import Flask, render_template, request, redirect
from ete3 import Tree, TreeNode, os

app = Flask(__name__)
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
aclist = []
nrg = 1
ss = None  # search succesful
sv1 = None  # show visualisation 1
sv2 = None  # show visualisation 2


@app.route("/")
def index():
    return render_template("upload.html")


@app.route("/upload", methods=['POST'])
def upload():
    target = os.path.join(APP_ROOT, "trees/")
    print(target)
    if not os.path.isdir(target):
        os.mkdir(target)

    for file in request.files.getlist("file"):
        print(file)
        filename = file.filename
        destination = "/".join([target, filename])
        print("for")
        print(destination)
        file.save(destination)
        global tree
        tree = Tree("trees/" + filename, format=1)
    return redirect('/processing')


@app.route("/processing")
def processing():
    i = 0
    for node in tree.traverse("levelorder"):
        node.add_features(id=i)
        aclist.append(node.name)
        i = i + 1
    return redirect('/visualisation1/graph/0')


# visual 1
@app.route('/visualisation1/graph/<id>')
def graphvisualize1(id=0):
    sv1 = 1
    sv2 = 0
    nodeG = None
    nodeName = None
    ss = None
    if id:
        for node in tree.traverse("preorder"):
            if node.id == int(id):
                nodeG = node
                nodeName = node.name
                break
    return render_template("visual.html", t=tree, nodeG=nodeG, nodeName=nodeName, ss=ss, aclist=aclist, nrg=nrg, sv1=sv1, sv2=sv2)


@app.route('/visualisation1/search/<search>')
def searchvis1(search=""):
    sv1 = 1
    sv2 = 0
    nodeG = None
    nodeName = None
    ss = 1
    if search:
        for node in tree.traverse("preorder"):
            if node.name == search:
                nodeG = node
                nodeName = node.name
                ss = None
                break
    return render_template("visual.html", t=tree, nodeG=nodeG, nodeName=nodeName, ss=ss, aclist=aclist, nrg=nrg, sv1=sv1, sv2=sv2)


@app.route('/visualisation2/graph/<id>')
def graphvisualize2(id=0):
    return render_template("visual.html", t=tree, NodeG=None, nodeName=None, ss=None, aclist=aclist, nrg=nrg, sv1=None, sv2=1)





if __name__ == "__main__":
    app.run(port=5000, debug=True)

