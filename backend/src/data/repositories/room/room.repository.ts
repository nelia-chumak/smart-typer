import {
  DEFAULT_PERSONAL_ROOM_NAME,
  MAX_USERS_IN_ROOM,
} from 'common/constants/constants';
import {
  CommonKey,
  RoomKey,
  RoomRelationMappings,
  TableName,
  UserKey,
  UserToRoomKey,
} from 'common/enums/enums';
import { IRoomRecord, IUserToRoomRecord } from 'common/interfaces/interfaces';
import {
  LessonDto,
  ParticipantsCount,
  RequiredLessonIdDto,
  RoomDto,
  Transaction,
} from 'common/types/types';
import { Room as RoomModel } from 'data/models/models';
import { toSnakeCase } from 'helpers/helpers';

type Constructor = {
  RoomModel: typeof RoomModel;
};

class Room {
  private _RoomModel: typeof RoomModel;

  public constructor(params: Constructor) {
    this._RoomModel = params.RoomModel;
  }

  public async create(
    data: Pick<IRoomRecord, RoomKey.NAME | RoomKey.IS_PRIVATE>,
  ): Promise<RoomDto> {
    const { id, lessonId, name } = await this._RoomModel
      .query()
      .insertAndFetch(data)
      .castTo<RoomDto>();

    return { id, lessonId, name, participants: [] };
  }

  public async createPersonal(
    trx?: Transaction,
  ): Promise<Pick<IUserToRoomRecord, UserToRoomKey.PERSONAL_ROOM_ID>> {
    const { personalRoomId } = await this._RoomModel
      .query(trx)
      .insert({
        name: DEFAULT_PERSONAL_ROOM_NAME,
        isPrivate: true,
      })
      .returning(`${CommonKey.ID} as ${UserToRoomKey.PERSONAL_ROOM_ID}`)
      .castTo<Pick<IUserToRoomRecord, UserToRoomKey.PERSONAL_ROOM_ID>>();

    return { personalRoomId };
  }

  public async getById(
    roomId: RoomDto[CommonKey.ID],
  ): Promise<RoomDto | undefined> {
    return this._RoomModel
      .query()
      .select(
        `${TableName.ROOMS}.${CommonKey.ID}`,
        `${TableName.ROOMS}.${RoomKey.LESSON_ID}`,
        `${TableName.ROOMS}.${RoomKey.NAME}`,
      )
      .findOne(`${TableName.ROOMS}.${CommonKey.ID}`, roomId)
      .withGraphJoined(`[${RoomRelationMappings.PARTICIPANTS}]`)
      .modifyGraph(RoomRelationMappings.PARTICIPANTS, (builder) => {
        builder.select(CommonKey.ID, UserKey.NICKNAME, UserKey.PHOTO_URL);
      })
      .castTo<RoomDto>();
  }

  public async getByIdWithParticipantsCount(
    roomId: RoomDto[CommonKey.ID],
  ): Promise<(ParticipantsCount & Pick<RoomDto, CommonKey.ID>) | undefined> {
    return this._RoomModel
      .query()
      .select([
        `${TableName.ROOMS}.${CommonKey.ID}`,
        this._RoomModel.knex().raw('count(*)::int as "count"'),
      ])
      .leftJoinRelated(RoomRelationMappings.USER_TO_CURRENT_ROOM)
      .where(`${TableName.ROOMS}.${CommonKey.ID}`, roomId)
      .groupBy(`${TableName.ROOMS}.${CommonKey.ID}`)
      .first()
      .castTo<ParticipantsCount & Pick<RoomDto, CommonKey.ID>>();
  }

  public async getOwnerIdByPersonalRoomId(
    roomId: RoomDto[CommonKey.ID],
  ): Promise<Pick<IUserToRoomRecord, UserToRoomKey.USER_ID> | undefined> {
    return this._RoomModel
      .query()
      .select(
        `${RoomRelationMappings.USER_TO_PERSONAL_ROOM}.${UserToRoomKey.USER_ID}`,
      )
      .findOne(`${TableName.ROOMS}.${CommonKey.ID}`, roomId)
      .innerJoinRelated(RoomRelationMappings.USER_TO_PERSONAL_ROOM)
      .castTo<Pick<IUserToRoomRecord, UserToRoomKey.USER_ID> | undefined>();
  }

  public async getAllAvailable(): Promise<RoomDto[]> {
    return this._RoomModel
      .query()
      .select(
        `${TableName.ROOMS}.${CommonKey.ID}`,
        `${TableName.ROOMS}.${RoomKey.LESSON_ID}`,
        `${TableName.ROOMS}.${RoomKey.NAME}`,
      )
      .leftJoin(
        TableName.USERS_TO_ROOMS,
        `${TableName.USERS_TO_ROOMS}.${UserToRoomKey.CURRENT_ROOM_ID}`,
        `${TableName.ROOMS}.${CommonKey.ID}`,
      )
      .where(`${TableName.ROOMS}.${RoomKey.IS_PRIVATE}`, false)
      .groupBy(
        `${TableName.ROOMS}.${CommonKey.ID}`,
        `${TableName.ROOMS}.${RoomKey.LESSON_ID}`,
        `${TableName.ROOMS}.${RoomKey.NAME}`,
      )
      .havingRaw(
        `count(distinct ${TableName.USERS_TO_ROOMS}.${CommonKey.ID}) < ?`,
        [MAX_USERS_IN_ROOM],
      )
      .withGraphJoined(`[${RoomRelationMappings.PARTICIPANTS}]`)
      .modifyGraph(RoomRelationMappings.PARTICIPANTS, (builder) => {
        builder.select(CommonKey.ID, UserKey.NICKNAME, UserKey.PHOTO_URL);
      })
      .castTo<RoomDto[]>();
  }

  public async removeById(
    roomId: RoomDto[CommonKey.ID],
  ): Promise<RoomDto[CommonKey.ID]> {
    return this._RoomModel
      .query()
      .findById(roomId)
      .delete()
      .returning([`${CommonKey.ID}`])
      .castTo<RoomDto[CommonKey.ID]>();
  }

  public async deleteCreatedBeforeTodayWithoutParticipants(): Promise<void> {
    await this._RoomModel
      .query()
      .delete()
      .whereRaw(
        `${TableName.ROOMS}.${toSnakeCase(CommonKey.CREATED_AT)}::date < CURRENT_DATE`,
      )
      .whereNotExists(
        this._RoomModel
          .knex()
          .select(1)
          .from(TableName.USERS_TO_ROOMS)
          .whereRaw(
            `${TableName.USERS_TO_ROOMS}.${toSnakeCase(UserToRoomKey.CURRENT_ROOM_ID)} = ${TableName.ROOMS}.${CommonKey.ID}`,
          ),
      )
      .whereNotExists(
        this._RoomModel
          .knex()
          .select(1)
          .from(TableName.USERS_TO_ROOMS)
          .whereRaw(
            `${TableName.USERS_TO_ROOMS}.${toSnakeCase(UserToRoomKey.PERSONAL_ROOM_ID)} = ${TableName.ROOMS}.${CommonKey.ID}`,
          ),
      );
  }

  public async updateLessonId(
    roomId: RoomDto[CommonKey.ID],
    lessonId: LessonDto[CommonKey.ID] | null,
  ): Promise<RequiredLessonIdDto> {
    return this._RoomModel
      .query()
      .update({ lessonId })
      .findOne({ [CommonKey.ID]: roomId })
      .returning([RoomKey.LESSON_ID])
      .castTo<RequiredLessonIdDto>();
  }
}

export { Room };
