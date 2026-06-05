import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { Country } from '../country/entities/country.entity';
import { City } from '../city/entities/city.entity';
import { TravelType } from '../project/travel-type/travel-type.entity';

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
    @InjectRepository(TravelType)
    private readonly travelTypeRepository: Repository<TravelType>,
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

    // Top destination countries from expatriation projects
    const topDestinations = await this.projectRepository
      .createQueryBuilder('project')
      .innerJoin('project.destinationCountry', 'country')
      .select('country.countryName', 'country')
      .addSelect('country.isoCode', 'isoCode')
      .addSelect('COUNT(project.idProject)', 'count')
      .groupBy('country.idCountry')
      .addGroupBy('country.countryName')
      .addGroupBy('country.isoCode')
      .orderBy('COUNT(project.idProject)', 'DESC')
      .take(6)
      .getRawMany();

    // Répartition par type de voyage
    const projectsByTravelType = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.travelType', 'travelType')
      .select('COALESCE(travelType.name, \'Non défini\')', 'travelType')
      .addSelect('COUNT(project.idProject)', 'count')
      .groupBy('travelType.idTravelType')
      .addGroupBy('travelType.name')
      .orderBy('COUNT(project.idProject)', 'DESC')
      .getRawMany();

    // 8 derniers projets créés (avec user + destination)
    const recentProjects = await this.projectRepository.find({
      relations: ['user', 'destinationCountry', 'travelType'],
      order: { idProject: 'DESC' },
      take: 8,
    });

    // New users in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: sevenDaysAgo })
      .getCount();

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
        newUsersThisWeek,
      },
      distribution: {
        projects: projectsByStatus,
        users: usersByRole,
        destinations: topDestinations,
        travelTypes: projectsByTravelType,
      },
      recentActivity: {
        topics: recentTopics,
        projects: recentProjects.map((p) => ({
          idProject: p.idProject,
          objective: p.objective,
          status: p.status,
          expectedDepartureDate: p.expectedDepartureDate,
          user: p.user
            ? {
                firstName: p.user.firstName,
                lastName: p.user.lastName,
                email: p.user.email,
              }
            : null,
          destinationCountry: p.destinationCountry
            ? { countryName: p.destinationCountry.countryName, isoCode: p.destinationCountry.isoCode }
            : null,
          travelType: p.travelType ? p.travelType.name : null,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
