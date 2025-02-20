/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */
import { expect } from "chai";
import { GroupsClient } from "../../grouping-and-mapping/clients/GroupsClient";
import { GroupContainer, GroupCreate, GroupUpdate } from "../../grouping-and-mapping/interfaces/Groups";
import * as sinon from "sinon";
import { PreferReturn } from "@itwin/imodels-client-authoring";

describe("Groups Client Unit tests", () => {
  const groupsClient: GroupsClient = new GroupsClient();
  let fetchStub: sinon.SinonStub;
  let requestStub: sinon.SinonStub;

  beforeEach(() => {
    fetchStub = sinon.stub(groupsClient, "fetchJSON" as any);
    requestStub = sinon.stub(groupsClient, "createRequest" as any);
    requestStub.returns("pass");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("Groups client - Create group", async () => {
    const newGroup: GroupCreate = {
      groupName: "AllElements",
      description: "Group description",
      query: "SELECT ECInstanceId, ECClassId FROM BisCore.Element",
      metadata: [{ key: "key1", value: "value1" }, { key: "key2", value: "value2" }],
    };

    const returns: GroupContainer = {
      group: {
        id: "1",
        groupName: "AllElements",
        description: "Group description",
        query: "SELECT ECInstanceId, ECClassId FROM BisCore.Element",
        metadata: [{ key: "key1", value: "value1" }, { key: "key2", value: "value2" }],
        _links: {
          iModel: {
            href: "https://api.bentley.com/imodels/iModelId",
          },
          mapping: {
            href: "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId",
          },
        },
      },
    };
    fetchStub.resolves(returns);

    const group = await groupsClient.createGroup("authToken", "mappingId", newGroup);
    expect(group.id).to.be.eq("1");
    expect(group.groupName).to.deep.equal(returns.group.groupName);
    expect(fetchStub.calledWith(
      "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId/groups",
      "pass",
    )).to.be.true;
    expect(requestStub.calledWith(
      "POST",
      "authToken",
      JSON.stringify(newGroup)
    )).to.be.true;
  });

  it("Groups client - Delete group", async () => {
    const returns = {
      status: 204,
    };
    fetchStub.resolves(returns);

    const response = await groupsClient.deleteGroup("authToken", "mappingId", "groupId");
    expect(fetchStub.calledWith(
      "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId/groups/groupId",
      "pass",
    )).to.be.true;

    expect(response.status).to.be.eq(204);
  });

  it("Groups client - Get group", async () => {
    const returns: GroupContainer = {
      group: {
        id: "1",
        groupName: "AllElements",
        description: "Group description",
        query: "SELECT ECInstanceId, ECClassId FROM BisCore.Element",
        metadata: [{ key: "key1", value: "value1" }, { key: "key2", value: "value2" }],
        _links: {
          iModel: {
            href: "https://api.bentley.com/imodels/iModelId",
          },
          mapping: {
            href: "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId",
          },
        },
      },
    };
    fetchStub.resolves(returns);

    const group = await groupsClient.getGroup("authToken", "mappingId", "1");
    expect(group.id).to.deep.equal("1");
    expect(fetchStub.calledWith(
      "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId/groups/1",
      "pass",
    )).to.be.true;
    expect(requestStub.calledWith(
      "GET",
      "authToken"
    )).to.be.true;
  });

  it("Groups client - Get groups minimal", async () => {
    const minimalReturns = {
      groups: [
        {
          id: "1",
          groupName: "PhysicalElements",
          description: "A group of physical elements",
          query: "SELECT ECInstanceId, ECClassId FROM BisCore.PhysicalElement",
        },
        {
          id: "2",
          groupName: "AllElements",
          description: "A group of all elements",
          query: "SELECT ECInstanceId, ECClassId FROM BisCore.Element",
        },
      ],
    };

    fetchStub.resolves(minimalReturns);
    const groupsList = await groupsClient.getGroups("authToken", "mappingId", PreferReturn.Minimal);
    expect(fetchStub.calledWith(
      "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId/groups",
      "pass",
    )).to.be.true;
    expect(requestStub.calledWith(
      "GET",
      "authToken",
      undefined,
      "minimal"
    )).to.be.true;
    expect(groupsList.groups.length).to.equal(2);
  });

  it("Groups client - Get groups representation", async () => {
    const fullReturns = {
      groups: [{
        id: "1",
        groupName: "PhysicalElements",
        description: "A group of physical elements",
        query: "SELECT ECInstanceId, ECClassId FROM BisCore.PhysicalElement",
        metadata: [{ key: "key1", value: "value1" }, { key: "key2", value: "value2" }],
        _links: {
          iModel: {
            href: "https://api.bentley.com/imodels/iModelId",
          },
          mapping: {
            href: "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId",
          },
        },
      },
      {
        id: "2",
        groupName: "AllElements",
        description: "A group of all elements",
        query: "SELECT ECInstanceId, ECClassId FROM BisCore.Element",
        metadata: [{ key: "key1", value: "value1" }],
        _links: {
          iModel: {
            href: "https://api.bentley.com/imodels/iModelId",
          },
          mapping: {
            href: "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId",
          },
        },
      }],
      _links: {
        next: undefined,
        self: {
          href: "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId/groups",
        },
      },
    };

    fetchStub.resolves(fullReturns);
    const groupsList = await groupsClient.getGroups("authToken", "mappingId", PreferReturn.Representation);
    expect(fetchStub.calledWith(
      "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId/groups",
      "pass",
    )).to.be.true;
    expect(requestStub.calledWith(
      "GET",
      "authToken",
      undefined,
      "representation"
    )).to.be.true;
    expect(groupsList.groups.length).to.equal(2);
    expect(groupsList.groups.every((group) => Array.isArray(group.metadata))).to.be.true;
  });

  it("Groups client - Update a group", async () => {
    const updateGroup: GroupUpdate = {
      groupName: "AllElements",
      description: "Updated description",
      query: "SELECT ECInstanceId, ECClassId FROM BisCore.Element",
      metadata: [{ key: "key1", value: "value1" }, { key: "key2", value: "value2" }],
    };

    const returns: GroupContainer = {
      group: {
        id: "1",
        groupName: "AllElements",
        description: "Updated description",
        query: "SELECT ECInstanceId, ECClassId FROM BisCore.Element",
        metadata: [{ key: "key1", value: "value1" }, { key: "key2", value: "value2" }],
        _links: {
          iModel: {
            href: "https://api.bentley.com/imodels/iModelId",
          },
          mapping: {
            href: "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId",
          },
        },
      },
    };
    fetchStub.resolves(returns);

    const group = await groupsClient.updateGroup("authToken", "mappingId", "1", updateGroup);
    expect(group.id).to.be.eq("1");
    expect(group.description).to.deep.equal(updateGroup.description);
    expect(fetchStub.calledWith(
      "https://api.bentley.com/grouping-and-mapping/datasources/imodel-mappings/mappingId/groups/1",
      "pass",
    )).to.be.true;
    expect(requestStub.calledWith(
      "PATCH",
      "authToken",
      JSON.stringify(updateGroup)
    )).to.be.true;
  });
});
