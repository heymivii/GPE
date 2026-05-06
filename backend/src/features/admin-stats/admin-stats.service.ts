import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { Country } from '../country/entities/country.entity';
import { City } from '../city/entities/city.entity';

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ExpatriationProject)
    private readonly projectRepository: Repository<ExpatriationProject>,
    @InjectRepository(ForumTopic)
    private readonly topicRepository: Repository<ForumTopic>,
    @InjectRepository(ForumMessage)
    private readonly messageRepository: Repository<ForumMessage>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async getGlobalStats() {
    const [
      totalUsers,
      totalProjects,
      totalTopics,
      totalMessages,
      totalCountries,
      totalCities,
    ] = await Promise.all([
      this.userRepository.count(),
      this.projectRepository.count(),
      this.topicRepository.count(),
      this.messageRepository.count(),
      this.countryRepository.count(),
      this.cityRepository.count(),
    ]);

    // Group projects by status
    const projectsByStatus = await this.projectRepository
      .createQueryBuilder('project')
      .select('project.status', 'status')
      .addSelect('COUNT(project.idProject)', 'count')
      .groupBy('project.status')
      .getRawMany();

    // Group users by role
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.roles', 'role')
      .addSelect('COUNT(user.idUser)', 'count')
      .groupBy('user.roles')
      .getRawMany();

    // Recent activity (last 5 topics)
    const recentTopics = await this.topicRepository.find({
      relations: ['user', 'country'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      counts: {
        users: totalUsers,
        projects: totalProjects,
        topics: totalTopics,
        messages: totalMessages,
        countries: totalCountries,
        cities: totalCities,
      },
      distribution: {
        projects: projectsByStatus,
        users: usersByRole,
      },
      recentActivity: {
        topics: recentTopics,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
