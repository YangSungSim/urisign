import { ParticipantService } from './participant.service';

describe('ParticipantService', () => {
  let service: ParticipantService;

  beforeEach(async () => {
    service = new ParticipantService(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
