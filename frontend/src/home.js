import { useState, useEffect, useCallback } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Paper, CardActionArea, CardMedia, Grid, Button, CircularProgress } from "@material-ui/core";
import cblogo from "./cblogo.png";
import image from "./bg.png";
import { DropzoneArea } from 'material-ui-dropzone';
import { common } from '@material-ui/core/colors';
import Clear from '@material-ui/icons/Clear';
import { motion, AnimatePresence } from "framer-motion";

const ColorButton = withStyles((theme) => ({
  root: {
    color: '#fff',
    backgroundColor: '#10b981',
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
    padding: '12px 30px',
    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
    '&:hover': {
      backgroundColor: '#059669',
      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.23)',
    },
  },
}))(Button);

const axios = require("axios").default;

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  mainContainer: {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${image})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    minHeight: "100vh",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  appbar: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    borderRadius: '0 0 20px 20px',
  },
  title: {
    fontWeight: 800,
    letterSpacing: '-0.5px',
    fontFamily: '"Outfit", sans-serif',
  },
  imageCard: {
    margin: "auto",
    width: "100%",
    maxWidth: 500,
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '30px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  media: {
    height: 350,
    borderRadius: '20px',
    margin: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  dropzone: {
    background: 'transparent !important',
    border: '2px dashed #10b981 !important',
    borderRadius: '20px !important',
    '& p': {
      color: '#4b5563 !important',
      fontFamily: '"Outfit", sans-serif !important',
      fontSize: '1.2rem !important',
    }
  },
  resultCard: {
    marginTop: '20px',
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '20px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  label: {
    color: '#065f46',
    fontWeight: 800,
    fontSize: '1.8rem',
    marginBottom: '5px',
  },
  confidence: {
    color: '#059669',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
  },
  loader: {
    color: '#10b981 !important',
    marginBottom: '20px',
  }
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  let confidence = 0;

  const sendFile = useCallback(async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
      try {
        let res = await axios({
          method: "post",
          url: process.env.REACT_APP_API_URL,
          data: formData,
        });
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      }
      setIsloading(false);
    }
  }, [image, selectedFile]);

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) {
      return;
    }
    setIsloading(true);
    sendFile();
  }, [preview, sendFile]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  return (
    <div className={classes.mainContainer}>
      <AppBar position="fixed" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            Potato Disease AI
          </Typography>
          <div className={classes.grow} />
          <Avatar src={cblogo} style={{ border: '2px solid #10b981' }}></Avatar>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed appbar */}

      <Container maxWidth="md" style={{ marginTop: '40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className={classes.imageCard}>
            <CardContent>
              <AnimatePresence mode="wait">
                {!image ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DropzoneArea
                      acceptedFiles={['image/*']}
                      dropzoneText={"Drop a leaf image to diagnose"}
                      onChange={onSelectFile}
                      dropzoneClass={classes.dropzone}
                      showPreviewsInDropzone={false}
                      showAlerts={false}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <CardMedia
                      className={classes.media}
                      image={preview}
                      title="Potato Leaf"
                    />
                    
                    {isLoading && (
                      <div className={classes.loaderContainer}>
                        <CircularProgress className={classes.loader} thickness={5} size={60} />
                        <Typography className={classes.title} variant="h6">
                          Analyzing Specimen...
                        </Typography>
                      </div>
                    )}

                    {data && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={classes.resultCard}
                      >
                        <Typography className={classes.label}>
                          {data.class}
                        </Typography>
                        <Typography className={classes.confidence}>
                          Confidence Score: {confidence}%
                        </Typography>
                        <div style={{ marginTop: '20px' }}>
                          <ColorButton 
                            variant="contained" 
                            onClick={clearData} 
                            startIcon={<Clear />}
                          >
                            New Diagnosis
                          </ColorButton>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
};

export default ImageUpload;

