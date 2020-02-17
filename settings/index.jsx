function settingsComponent(props) {
  const colorSet = [
    { color: "white" },
    { color: "blanchedalmond" },
    { color: "burlywood" },
    { color: "orange" },
    { color: "springgreen" },
    { color: "limegreen" },
    { color: "darkgreen" },
    { color: "cadetblue" },
    { color: "darkcyan" },
    { color: "darkslategray" },
    { color: "dodgerblue" },
    { color: "blue" },
    { color: "chocolate" },
    { color: "pink" },
    { color: "magenta" },
    { color: "red" },
    { color: "blueviolet" },
    { color: "purple" },
  ];
  return (
    <Page>
      <Section
        title={
          <Text bold align="center">
            Battery Log Settings
          </Text>
        }
        description={
        }
      />
      <Section>
        <Toggle
          settingsKey='display'
          label={`Display ${props.settings.display === 'true' ? 'on' : 'off'}`}
        />
        <Text>
          You can set the display of your Fitbit device to be on or off while charging
          </Text>
      </Section>
      <Section>
        <Text bold align='center'>
          Choose font color
          </Text>
        <ColorSelect
          settingsKey='fontColor'
          centered={true}
          colors={colorSet}
        />
      </Section>
      {/* <Section>
        <Button
          label="Reset settings"
          onClick={() => {
            console.log('reset pressed');
            props.settingsStorage.clear();
          }}
        />
      </Section> */}
    </Page>
  );
}

registerSettingsPage(settingsComponent);
