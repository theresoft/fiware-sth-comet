# -*- coding: utf-8 -*-
#
# Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of Short Term Historic (FI-WARE project).
#
# iot-sth is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
# Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
# later version.
# iot-sth is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
# warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along with iot-sth. If not, see
# http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License please contact:
# iot_support at tid.es
#
__author__ = 'Iván Arias León (ivan.ariasleon at telefonica dot com)'

#
#  Note: the "skip" tag is to skip the scenarios that still are not developed or failed
#        -tg=-skip
#

Feature: get aggregated values with differents requests from sth
  As a sth user
  I want to be able to get aggregated values with differents requests from sth
  so that they become more functional and useful


  @happy_path
  Scenario: get aggregates values using sth
    Given service "test_happy_path", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully

  @service
  Scenario Outline: get aggregates values using sth with several services
    Given service "<service>", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
    And delete database in mongo
  Examples:
    | service                    |
    | orga601000                 |
    | ORGA601110                 |
    | Org_614010                 |
    | random service length = 50 |

  @service_path
  Scenario Outline: get aggregates values using sth with several services paths
    Given service "test_service_path", service path "<service_path>", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
  Examples:
    | service_path                    |
    | serv60100                       |
    | SERV60120                       |
    | Serv_6140                       |
    | 12345678900                     |
    | /12345678900                    |
    | /                               |
    | random service path length = 50 |

  @entity_type
  Scenario Outline: get aggregates values using sth with several entity_types
    Given service "test_entity_type", service path "/test", entity type "<entity_type>", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
    And delete database in mongo
  Examples:
    | entity_type |
    | room        |
    | HOUSE       |
    | HOUSE34     |
    | HOUSE_34    |
    | HouSE_34    |
    | house_flat  |
    | house.flat  |
    | house@flat  |
    | house-flat  |
    | house<flat> |

  @entity_type_error
  Scenario Outline: get aggregates values using sth with wrong several entity_types
    Given service "test_entity_type", service path "/test", entity type "<entity_type>", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "Not Found" http code
  Examples:
    | entity_type |
    | house/flat  |
    | house#flat  |

  @entity_id
  Scenario Outline: get aggregates values using sth with several entity_id
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "<entity_id>", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
  Examples:
    | entity_id   |
    | room1       |
    | romm_2      |
    | ROOM        |
    | ROOM4       |
    | ROOM_56     |
    | romm.light  |
    | room-light  |
    | room@light  |
    | room<light> |

  @entity_id_error
  Scenario Outline: get aggregates values using sth with several wrong entity_id
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "<entity_id>", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "Not Found" http code
  Examples:
    | entity_id  |
    | room/ligth |
    | room#light |

  @attribute_name
  Scenario Outline: get aggregates values using sth with several attributes names
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "<attribute_name>" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
  Examples:
    | attribute_name   |
    | random           |
    | random number=60 |
    | temperature      |
    | tempo_45         |

  @attribute_name_error
  Scenario Outline: get aggregates values using sth with several wrong attributes name
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "<attribute_name>" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "Not Found" http code
  Examples:
    | attribute_name |
    | tempo/45       |

  @attribute_name_error
  Scenario Outline: get aggregates values using sth with several wrong attributes name
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "<attribute_name>" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "Bad Request" http code
  Examples:
    | attribute_name |
    | tempo#45       |

  @attribute_value
  Scenario Outline: get aggregates values using sth with several attributes values and metadatas
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "<attributes_value>", metadata value "<metadata>" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
  Examples:
    | attributes_value                    | metadata |
    | 34                                  | True     |
    | 34.67                               | False    |
    | 0.45                                | True     |
    | 4.324234233129797897978997          | False    |
    | 4234234234.324234233129797897978997 | False    |
    | random number=10                    | True     |

  @method
  Scenario Outline: get aggregates values using sth with several aggregated methods
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "<method>" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
  Examples:
    | method |
    | sum    |
    | sum2   |
    | min    |
    | max    |

  @method_error
  Scenario Outline: get aggregates values using sth with several aggregated methods
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "<method>" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "Bad Request" http code
  Examples:
    | method |
    | fdgf   |
    | 1234   |
    | er/ewr |
    | 23#ere |
    | ab&ere |
    | ty?dfs |

  @resolution @BUG_50 @skip
  Scenario Outline: get aggregates values using sth with several resolutions period
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "<resolution>"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully
  Examples:
    | resolution |
    | month      |
    | day        |
    | hour       |
    | minute     |
    | second     |

  @resolution_error
  Scenario Outline: get aggregates values using sth with several wrong resolutions period
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "<resolution>"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "Bad Request" http code

  Examples:
    | resolution |
    | fdgf       |
    | 1234       |
    | er/ewr     |
    | 23#ere     |
    | ab&ere     |
    | ty?dfs     |

  @dates @date_both
  Scenario: get aggregates values using sth with both dates
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully

  @dates @date_only_dateFrom
  Scenario: get aggregates values using sth with only dateFrom
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateFrom  | 2015-02-14T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully

  @dates @date_only_dateTo @BUG_XX @skip
  Scenario: get aggregates values using sth with only dateTo
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value               |
      | dateTo    | 2015-12-31T00:00:00 |
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully

  @dates @date_without_dates
  Scenario: get aggregates values using sth without dates
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
    Then I receive an "OK" http code
    And validate that the aggregated is returned successfully

  @date @date_without_values
  Scenario Outline: get aggregates values using sth with both dates
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value      |
      | dateFrom  | <dateFrom> |
      | dateTo    | <dateTo>   |
    Then I receive an "OK" http code
    And verify that not return aggregated values
  Examples:
    | dateFrom            | dateTo              |
    | 2015-12-31T00:00:00 | 2015-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-31T00:00:00 |

  @date @date_error
  Scenario Outline: get aggregates values using sth with both dates
    Given service "test_entity_id", service path "/test", entity type "room", entity_id "room2", with attribute number "1", attribute name "random" and attribute type "celcius"
    And receives a notification with attributes value "random number=2", metadata value "True" and content "json"
    When ask for aggregates with method "sum" and resolution "day"
      | date_type | value      |
      | dateFrom  | <dateFrom> |
      | dateTo    | <dateTo>   |
    Then I receive an "Bad Request" http code
  Examples:
    | dateFrom            | dateTo              |
    |                     |                     |
    | 2010-12-31T00:00:00 |                     |
    |                     | 2015-12-31T00:00:00 |
    | 201012-31T00:00:00  | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 201412-31T00:00:00  |
    | 2010_12-31T00:00:00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12_31T00:00:00 |
    | 201e-12-31T00:00:00 | 2010-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 201e-12-31T00:00:00 |
    | 2010-17-31T00:00:00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-17-31T00:00:00 |
    | 2010-12-36T00:00:00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-36T00:00:00 |
    | 2010-12-31T25:00:00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-31T25:00:00 |
    | 2010-12-31T00:64:00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-31T00:64:00 |
    | 2010-12-31T00:00:66 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-31T00:00:66 |
    | 2010-12-31T00.00:00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-31T00.00:00 |
    | 2010-12-31T00:00.00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-31T00:00.00 |
    | 2010-12-31 00:00:00 | 2014-12-31T00:00:00 |
    | 2010-12-31T00:00:00 | 2014-12-31 00:00:00 |







