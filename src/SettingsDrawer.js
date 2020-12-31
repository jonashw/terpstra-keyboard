import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import Switch from "@material-ui/core/Switch";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Fab from "@material-ui/core/Fab";
import SettingsIcon from "@material-ui/icons/Settings";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

export default ({ optionsVisible, setOptionsVisible, options, variables }) => {
  return (
    <>
      <Fab
        color="primary"
        aria-label="settings"
        onClick={(e) => setOptionsVisible(true)}
        style={{
          zIndex: 100,
          position: "absolute",
          left: "16px",
          bottom: "16px"
        }}
      >
        <SettingsIcon />
      </Fab>
      <Drawer
        anchor={"bottom"}
        open={optionsVisible}
        onClose={() => setOptionsVisible(false)}
      >
        <List>
          <ListItem key="Title">
            <Typography variant="h6" gutterBottom>
              SETTINGS
            </Typography>
            <ListItemSecondaryAction>
              <Button onClick={() => setOptionsVisible(false)}>
                <CloseIcon />
              </Button>
            </ListItemSecondaryAction>
          </ListItem>

          {options.map((o) => (
            <ListItem key={o.label}>
              <Typography gutterBottom>{o.label}</Typography>
              <br />
              {(() => {
                switch (o.type) {
                  case "select":
                    return (
                      <FormControl>
                        <InputLabel id={o.id}>{o.label}</InputLabel>
                        <Select
                          labelId={o.id}
                          value={o.value}
                          onChange={(e) => o.setFn(e.target.value)}
                        >
                          {o.options.map((o) => (
                            <MenuItem value={o.value}>{o.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  case "switch":
                    return (
                      <Switch
                        checked={o.checked}
                        onChange={(e) => o.setFn(e.target.checked)}
                      />
                    );
                  case "range":
                    return (
                      <Slider
                        defaultValue={o.value}
                        aria-labelledby="discrete-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        onChange={(e, newValue) => {
                          o.setFn(newValue);
                        }}
                        marks
                        min={o.min}
                        max={o.max}
                      />
                    );
                  default:
                    return "";
                }
              })()}
            </ListItem>
          ))}
        </List>
        {/*
      <Divider />
      <List>
        {variables.map((v) => (
          <ListItem>
            <ListItemText primary={v.label} />
            <ListItemSecondaryAction>
              <Typography>{v.value}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      */}
      </Drawer>
    </>
  );
};
