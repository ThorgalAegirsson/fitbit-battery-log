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
          <Text>
            You can set the display of your Fitbit device to be on or off during charging
          </Text>
        }
      />
      <Section>
        <Toggle
          settingsKey='toggle'
          label={`Display ${props.settings.toggle === 'true' ? 'on' : 'off'}`}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(settingsComponent);
