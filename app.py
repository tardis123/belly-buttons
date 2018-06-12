# Import dependencies
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

# Flask Setup
app = Flask(__name__)
# Database configuration and connection
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/belly_button_biodiversity.sqlite"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
db.reflect(app = app)

class OTU(db.Model):
    __tablename__ = 'otu'

class Metadata(db.Model):
    __tablename__ = 'samples_metadata'

class Samples(db.Model):
    __tablename__ = 'samples'

# Flask routes
@app.route("/", methods=["GET"])
def home():

    return render_template("index.html")

@app.route("/names", methods=["GET"])
# Get sample names
def column_names():

    sample_names = [column_name for column_name in Samples.__table__.columns.keys()]
    sample_names.remove("otu_id")

    return jsonify(sample_names)

@app.route("/otu", methods=["GET"])
# Get OTU descriptions and OTU
def OTU_descriptions():

    #result = db.session.query(OTU.otu_id, OTU.lowest_taxonomic_unit_found).all()
    result = db.session.query(OTU.lowest_taxonomic_unit_found).all()

    otu_list = []
    for item in result:
        #otu_dict = {}
        #otu_dict["otu_id"] = item.otu_id
        #otu_dict["lowest_taxonomic_unit"] = "" .join(item.lowest_taxonomic_unit_found)
        #otu_list.append(otu_dict)
        otu_list.append(item)


    otu_list = [" ".join(x) for x in otu_list]
    
    return jsonify(otu_list)

@app.route("/metadata/<sample>", methods=["GET"] )
# Get metadata for a given sample
# In order to get the metadata SAMPLEID, we need to strip the part before the _ sign
# Sample name format seems to be X_SAMPLEID whereas X could present any combination of characters
# So the best way is to split on the _ sign and grab the part on the right hand side of it
def metadata_sample(sample):
    
    result = db.session.query(Metadata.AGE,\
                                Metadata.BBTYPE,\
                                Metadata.ETHNICITY,\
                                Metadata.GENDER,\
                                Metadata.LOCATION,\
                                Metadata.SAMPLEID).\
                                filter(Metadata.SAMPLEID ==sample.split('_')[1]).all() 

    list_metadata =[]
    for item in result:
        metadata_dict = {}
        metadata_dict["AGE"] = item.AGE
        metadata_dict["BBTYPE"] = item.BBTYPE
        metadata_dict["ETHNICITY"] = item.ETHNICITY
        metadata_dict["GENDER"] = item.GENDER
        metadata_dict["LOCATION"] = item.LOCATION
        metadata_dict["SAMPLEID"] = item.SAMPLEID

        list_metadata.append(metadata_dict)

    return jsonify(list_metadata)
    #print(result)

@app.route("/wfreq/<sample>", methods=["GET"])
# In order to get the metadata SAMPLEID, we need to strip the part before the _ sign
# Sample name format seems to be X_SAMPLEID whereas X could present any combination of characters
# So the best way is to split on the _ sign and grab the part on the right hand side of it

def wfreq(sample):

    result = db.session.query(Metadata.WFREQ).\
                                filter(Metadata.SAMPLEID ==sample.split('_')[1]).all()
    return jsonify(result)

@app.route("/samples/<sample>", methods=["GET"])
# GET OTU and sample values for a given sample
def samples(sample):

    result = db.session.query(Samples.otu_id, getattr(Samples, sample)).\
                                filter(getattr(Samples, sample) != 0).\
                                order_by(getattr(Samples, sample).desc()).all()

    otu_ids = {"otu_ids": list([x[0] for x in result])}
    sample_values = {"sample_values": list([x[1] for x in result])}
    return jsonify(otu_ids, sample_values)

# Define main behavior
if __name__ == "__main__":
    app.run(debug=True)