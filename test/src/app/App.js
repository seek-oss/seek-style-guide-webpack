import React from 'react';
import {
  StyleGuideProvider,
  Header,
  Footer,
  PageBlock,
  Card,
  Section,
  Text,
  ButtonGroup,
  Button
} from 'seek-style-guide/react';

export default () => (
  <StyleGuideProvider>
    <Header authenticationStatus="unauthenticated" />
    <PageBlock>
      <Section header>
        <Text hero>Hello world</Text>
      </Section>
      <Card>
        <Section>
          <ButtonGroup>
            <Button color="pink">Primary</Button>
            <Button color="transparent">Secondary</Button>
          </ButtonGroup>
        </Section>
      </Card>
    </PageBlock>
    <Footer />
  </StyleGuideProvider>
);
