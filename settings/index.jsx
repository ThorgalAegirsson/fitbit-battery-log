function settingsComponent(props) {
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
          settingsKey='toggle'
          label={`Display ${props.settings.toggle === 'true' ? 'on' : 'off'}`}
          />
          <Text>
            You can set the display of your Fitbit device to be on or off during charging
          </Text>
      </Section>
      <Section>
          <Text bold align='center'>
            Choose font color
          </Text>
        <ColorSelect
          settingsKey='fontColor'
          centered={true}
          colors={[
            { color: "white" },
            { color: "limegreen" },
            { color: "springgreen" },
            { color: "dodgerblue" },
            { color: "orange" },
            { color: "red" }
          ]}
          onSelection={value=>console.log(value)}
        />
      </Section>
      <Section>
        <Button
          label="Reset settings"
          onClick={()=>props.settingsStorage.clear()}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(settingsComponent);
